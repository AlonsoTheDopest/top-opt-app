module MySIMP

# -------------------------------
# Dependencies
# -------------------------------
using Gridap, Gridap.Geometry, Gridap.Fields, Gridap.TensorValues, Gridap.CellData
using Gmsh, GridapGmsh
using LinearAlgebra
using ChainRulesCore, Zygote
import ChainRulesCore: rrule
using NLopt
using CairoMakie, GridapMakie

# -------------------------------
# Global constants
# -------------------------------
const E_mat = 1.0
const ν_mat = 0.3
const penal = 3
const NO_FIELDS = ZeroTangent()

# ==================================================
# =============== MESHING & MODEL ===================
# ==================================================

"""
    create_mesh(filename::String; L=60, H=20, hf=L/200, Hw=H/20)

Creates an MBB beam mesh and saves it to `filename`.
"""
# Global flag for Gmsh initialization
const GMSH_INITIALIZED = Ref(false)
function create_mesh(filename::String; L=60, H=20, hf=L/200, Hw=H/20)
    mesh_dir = dirname(filename)
    if !isdir(mesh_dir)
        mkpath(mesh_dir)
        println("Created folder: $mesh_dir")
    end
    # Only initialize Gmsh once
    if !GMSH_INITIALIZED[]
        gmsh.initialize()
        gmsh.option.setNumber("General.Terminal", 1)
        GMSH_INITIALIZED[] = true
    end

    # If mesh file already exists, skip creation
    if isfile(filename)
        println("Mesh file already exists: $filename")
        return filename
    end

    Hp = H / 2
    gmsh.model.geo.addPoint(0.0, 0.0, 0.0, hf, 1)
    gmsh.model.geo.addPoint(L, 0.0, 0.0, hf, 2)
    gmsh.model.geo.addPoint(L, Hp - Hw, 0.0, hf, 21)
    gmsh.model.geo.addPoint(L, Hp + Hw, 0.0, hf, 22)
    gmsh.model.geo.addPoint(L, H, 0.0, hf, 3)
    gmsh.model.geo.addPoint(0.0, H, 0.0, hf, 4)

    gmsh.model.geo.addLine(1, 2, 1)
    gmsh.model.geo.addLine(2, 21, 2)
    gmsh.model.geo.addLine(21, 22, 21)
    gmsh.model.geo.addLine(22, 3, 22)
    gmsh.model.geo.addLine(3, 4, 3)
    gmsh.model.geo.addLine(4, 1, 4)
    gmsh.model.geo.addCurveLoop([1, 2, 21, 22, 3, 4], 1)
    gmsh.model.geo.addPlaneSurface([1], 1)

    gmsh.model.addPhysicalGroup(2, [1], 1)
    gmsh.model.setPhysicalName(2, 1, "Domain")

    gmsh.model.addPhysicalGroup(1, [21], 1)
    gmsh.model.addPhysicalGroup(1, [4], 2)
    gmsh.model.setPhysicalName(1, 1, "LoadLine")
    gmsh.model.setPhysicalName(1, 2, "LeftSupport")

    gmsh.model.geo.synchronize()
    gmsh.model.mesh.generate(2)
    gmsh.write(filename)
    gmsh.finalize()
    return filename
end

"""
    load_model(filename::String)

Loads a `.msh` file into a Gridap model.
"""
function load_model(filename::String)
    model = GmshDiscreteModel(filename)
    writevtk(model, "Mesh")
    return model
end

# ==================================================
# =============== MATERIAL PROPERTIES ===============
# ==================================================

function ElasFourthOrderConstTensor(E, ν, PlanarState)
    if PlanarState == 1
        C1111 = E / (1 - ν^2)
        C1122 = (ν * E) / (1 - ν^2)
        C1212 = E / (2 * (1 + ν))
    elseif PlanarState == 2
        C1111 = (E * (1 - ν^2)) / ((1 + ν) * (1 - ν - 2ν^2))
        C1122 = (ν * E) / (1 - ν - 2ν^2)
        C1212 = E / (2 * (1 + ν))
    end
    return SymFourthOrderTensorValue(C1111, 0.0, C1122, 0.0, C1212, 0.0, C1122, 0.0, C1111)
end

σfun(ε) = C_mat ⊙ ε
Em(p) = p ^ penal
const C_mat = ElasFourthOrderConstTensor(E_mat, ν_mat, 1)

# ==================================================
# =============== FEA SETUP ========================
# ==================================================

"""
    setup_fem(model)

Prepares FEA spaces, measures, and boundary labels.
Returns a NamedTuple `fem_params`.
"""
function setup_fem(model)
    order = 1
    reffe_Disp = ReferenceFE(lagrangian, VectorValue{2, Float64}, order)
    V0_Disp = TestFESpace(model, reffe_Disp; conformity=:H1,
        dirichlet_tags=["LeftSupport"], dirichlet_masks=[(true, true)])
    U0_Disp = V0_Disp

    degree = 2 * order
    Ω = Triangulation(model)
    dΩ = Measure(Ω, degree)

    labels = get_face_labeling(model)
    LoadTagId = get_tag_from_name(labels, "LoadLine")
    Γ_Load = BoundaryTriangulation(model; tags=LoadTagId)
    dΓ_Load = Measure(Γ_Load, degree)
    n_Γ_Load = get_normal_vector(Γ_Load)

    p_reffe = ReferenceFE(lagrangian, Float64, 0)
    Q = TestFESpace(Ω, p_reffe, vector_type=Vector{Float64})
    P = Q
    np = num_free_dofs(P)

    pf_reffe = ReferenceFE(lagrangian, Float64, 1)
    Qf = TestFESpace(Ω, pf_reffe, vector_type=Vector{Float64})
    Pf = Qf

    fem_params = (; V0_Disp, U0_Disp, Q, P, Qf, Pf, np, Ω, dΩ, n_Γ_Load, dΓ_Load)
    return fem_params
end

# ==================================================
# =============== CORE FEA FUNCTIONS ===============
# ==================================================

function A_Disp(u, v, pth)
    ((p -> Em(p)) ∘ pth) * (ε(v) ⊙ (σfun ∘ ε(u)))
end

function MatrixA(pth; fem_params)
    A_mat = assemble_matrix(fem_params.U0_Disp, fem_params.V0_Disp) do u, v
        ∫(A_Disp(u, v, pth))fem_params.dΩ
    end
    return lu(A_mat)
end

"""
    stepDisp(fem_params, pth)

Solves the displacement field for given density field `pth`.
"""
function stepDisp(fem_params, pth)
    f = VectorValue(0, -1.0)
    A_Disp(u, v, pth) = ((p -> Em(p)) ∘ pth) * ε(v) ⊙ (σfun ∘ ε(u))
    a_Disp(u, v) = ∫(A_Disp(u, v, pth))fem_params.dΩ
    b_Disp(v) = ∫(v ⋅ f)fem_params.dΓ_Load
    op_Disp = AffineFEOperator(a_Disp, b_Disp, fem_params.U0_Disp, fem_params.V0_Disp)
    uh_out = solve(op_Disp)
    return get_free_dof_values(uh_out)
end

# ==================================================
# =============== FILTER & THRESHOLD ===============
# ==================================================

function Filter(p0; r, fem_params)
    a_f(r, u, v) = r^2 * (∇(v) ⋅ ∇(u))
    ph = FEFunction(fem_params.P, p0)
    op = AffineFEOperator(fem_params.Pf, fem_params.Qf) do u, v
        ∫(a_f(r, u, v))fem_params.dΩ + ∫(v * u)fem_params.dΩ,
        ∫(v * ph)fem_params.dΩ
    end
    pfh = solve(op)
    return get_free_dof_values(pfh)
end

Threshold(pfh; β, η) =
    (tanh(β * η) + tanh(β * (pfh - η))) /
    (tanh(β * η) + tanh(β * (1.0 - η)))

# ==================================================
# =============== OBJECTIVE FUNCTIONS ==============
# ==================================================

function gf_pf(pf_vec; β, η, fem_params)
    pfh = FEFunction(fem_params.Pf, pf_vec)
    pth = (pf -> Threshold(pf; β, η)) ∘ pfh
    u_vec = stepDisp(fem_params, pth)
    K_mat = assemble_matrix(fem_params.U0_Disp, fem_params.V0_Disp) do u, v
        0.5 * ∫((∇(u))' ⊙ (C_mat ⊙ ∇(v)))fem_params.dΩ
    end
    return u_vec' * K_mat * u_vec
end

# ==================================================
# =============== OPTIMIZATION =====================
# ==================================================

"""
    optimize_topology(fem_params; r, β, η, volfrac, TOL=1e-5, MAX_ITER=5000)

Runs MMA optimization and returns `(g_opt, p_opt)`.
"""
# function optimize_topology(fem_params; r, β, η, volfrac, TOL=1e-5, MAX_ITER=5000)
#     opt = Opt(:LD_MMA, fem_params.np)
#     opt.lower_bounds = 0.001
#     opt.upper_bounds = 1.0
#     opt.xtol_rel = TOL
#     opt.maxeval = parse( Int, MAX_ITER )
#     p_init = fill(volfrac, fem_params.np)

#     opt.min_objective = (p0, grad) -> begin
    
#         if !isempty(grad)
#             dgdp, = Zygote.gradient(p -> gf_pf(Filter(p; r, fem_params); β, η, fem_params), p0)
#             grad[:] = dgdp
#         end
#         gf_pf(Filter(p0; r, fem_params); β, η, fem_params)
#     end

#     dv = get_array(∫(1)fem_params.dΩ)
#     getpoints = get_cell_points(fem_params.Ω)
#     inequality_constraint!(opt, (p0, gradc) -> begin
#         gradc[:] = dv
#         pf_vec = Filter(p0; r, fem_params)
#         pfh = FEFunction(fem_params.Pf, pf_vec)
#         pth = (pf -> Threshold(pf; β, η)) ∘ pfh
#         pthxtr = evaluate(pfh ⊙ dv, getpoints)
#         return sum(pthxtr)[1] - volfrac * sum(dv)
#     end, 1e-8)

#     g_opt, p_opt, ret = optimize(opt, p_init)
#     println("Optimization finished: g_opt=$g_opt, result=$ret")
#     return g_opt, p_opt
# end
function optimize_topology(fem_params; r, β, η, volfrac, TOL=1e-5, MAX_ITER=5000)
    opt = Opt(:LD_MMA, fem_params.np)
    opt.lower_bounds = 0.001
    opt.upper_bounds = 1.0
    opt.xtol_rel = TOL
    opt.maxeval = parse(Int, string(MAX_ITER))  # make sure it's Int
    p_init = fill(volfrac, fem_params.np)

    # ---------------------------------------------------------
    # Objective function
    # ---------------------------------------------------------
    opt.min_objective = (p0, grad) -> begin
        try
            # 1. Filter densities
            pf = Filter(p0; r, fem_params)

            # 2. Compute compliance (should be scalar)
            J = gf_pf(pf; β, η, fem_params)

            # Debug print — check type
            println("Compliance type: ", typeof(J))

            # 3. Compute gradient if needed
            if !isempty(grad)
                dgdp, = Zygote.gradient(p -> gf_pf(Filter(p; r, fem_params); β, η, fem_params), p0)
                grad[:] = dgdp
            end

            # 4. Return scalar Float64
            return Float64(J)

        catch e
            @error "Objective evaluation failed" e
            return 1e12  # penalty if something goes wrong
        end
    end

    # ---------------------------------------------------------
    # Volume constraint
    # ---------------------------------------------------------
    dv = get_array(∫(1)fem_params.dΩ)
    getpoints = get_cell_points(fem_params.Ω)

    inequality_constraint!(opt, (p0, gradc) -> begin
        gradc[:] = dv
        pf_vec = Filter(p0; r, fem_params)
        pfh = FEFunction(fem_params.Pf, pf_vec)
        pth = (pf -> Threshold(pf; β, η)) ∘ pfh
        pthxtr = evaluate(pfh ⊙ dv, getpoints)
        return sum(pthxtr)[1] - volfrac * sum(dv)
    end, 1e-8)

    # ---------------------------------------------------------
    # Run the optimization
    # ---------------------------------------------------------
    g_opt, p_opt, ret = optimize(opt, p_init)
    println("Optimization finished: g_opt=$g_opt, result=$ret")
    return g_opt, p_opt
end


# ==================================================
# =============== POSTPROCESSING ===================
# ==================================================

"""
    plot_result(fem_params, p_opt; r, βpost, η, filename="result.png")

Plots and saves the optimized topology.
"""
function plot_result(fem_params, p_opt; r, βpost=64, η=0.5, filename="result.png")
    pf_vec = Filter(p_opt; r, fem_params)
    pfh = FEFunction(fem_params.Pf, pf_vec)
    pth = (pf -> Threshold(pf; βpost, η)) ∘ pfh

    fig, ax, plt = plot(fem_params.Ω, pth, colormap=:binary)
    Colorbar(fig[1, 2], plt)
    ax.aspect = AxisAspect(3)
    ax.title = "Optimized Design"
    limits!(ax, 0, 60, 0, 20)
    save(filename, fig)
    writevtk(fem_params.Ω, "result", cellfields=["p_opt" => p_opt, "pfh" => pfh, "pth" => pth])
    return filename
end

export create_mesh, load_model, setup_fem, optimize_topology, plot_result

end # module
