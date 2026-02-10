# cantilever-top-opt.jl

# FEA 
using  Gridap
using  Gridap.Geometry
using  Gridap.Fields
using  Gridap.TensorValues 
using  Gridap.CellData 

# Meshing 
using  Gmsh 
using  GridapGmsh

using  LinearAlgebra 

# Gardient calculation 
using  ChainRulesCore, Zygote
import ChainRulesCore: rrule 

# For MMA 
using  NLopt 

# For plotting 
using CairoMakie, GridapMakie 

const  E_mat = 1.0
const  ν_mat = 0.3 
const  penal = 3

model = GmshDiscreteModel("./mesh.msh"); 

function  ElasFourthOrderConstTensor(E,ν,PlanarState)
    # 1 for  Plane  Stress  and 2 Plane  Strain  Condition
    if  PlanarState  == 1
        C1111 =E/(1-ν*ν)
        C1122 = (ν*E)/(1-ν*ν)
        C1112 = 0.0
        C2222 =E/(1-ν*ν)
        C2212 = 0.0
        C1212 =E/(2*(1+ν))
    elseif  PlanarState  == 2
        C1111 = (E*(1-ν*ν))/((1+ν)*(1-ν-2*ν*ν))
        C1122 = (ν*E)/(1-ν-2*ν*ν)
        C1112 = 0.0
        C2222 = (E*(1-ν))/(1-ν-2*ν*ν)
        C2212 = 0.0
        C1212 =E/(2*(1+ν))
    end
    C_ten = SymFourthOrderTensorValue(C1111 ,C1112 ,C1122 ,C1112 ,C1212 ,C2212 ,C1122 ,C2212 ,C2222)
    return   C_ten
end 

function σfun(ε)
    σ = C_mat⊙ε
    return  σ
end 

function Em(p)
    Em = p ^ penal
    return Em
end 

const  C_mat = ElasFourthOrderConstTensor(E_mat ,ν_mat ,1);

order = 1
reffe_Disp = ReferenceFE(lagrangian ,VectorValue{2,Float64},order)

if beam_type == "cantilever"
    V0_Disp = TestFESpace(model,reffe_Disp;conformity =:H1,
        dirichlet_tags = ["LeftSupport"],
        dirichlet_masks =[(true,true)])

elseif beam_type == "half-mbb"
    V0_Disp = TestFESpace(model,reffe_Disp;conformity =:H1,
        dirichlet_tags = ["LeftSupport","RightSupport"],
        dirichlet_masks =[(true,false),(false,true)])
end
uh = zero(V0_Disp)
U0_Disp = V0_Disp 

degree = 2*order
Ω= Triangulation(model)
dΩ= Measure(Ω,degree) 

labels = get_face_labeling(model)
LoadTagId = get_tag_from_name(labels ,"LoadLine")
Γ_Load = BoundaryTriangulation(model ;tags = LoadTagId)
dΓ_Load = Measure(Γ_Load ,degree)
n_Γ_Load = get_normal_vector(Γ_Load) 

p_reffe = ReferenceFE(lagrangian, Float64, 0)
Q = TestFESpace(Ω, p_reffe, vector_type = Vector{Float64})
P = Q
np = num_free_dofs(P) 

pf_reffe = ReferenceFE(lagrangian, Float64, 1)
Qf = TestFESpace(Ω, pf_reffe, vector_type = Vector{Float64})
Pf = Qf 

fem_params = (;V0_Disp, U0_Disp, Q, P, Qf, Pf, np, Ω, dΩ, n_Γ_Load, dΓ_Load) 

A_Disp(u,v,pth) =  ((p->Em(p))∘pth) * (ε(v) ⊙ (σfun∘(ε(u))))
function MatrixA(pth; fem_params)
    A_mat = assemble_matrix(fem_params.U0_Disp, fem_params.V0_Disp) do u, v
        ∫(A_Disp(u,v,pth))fem_params.dΩ
    end
    return lu(A_mat)
end

function  stepDisp(fem_params,pth)
    A_Disp(u,v,pth) = ((p->Em(p))∘pth) * ε(v) ⊙ (σfun∘(ε(u)))
    a_Disp(u,v) = ∫(A_Disp(u,v,pth))fem_params.dΩ
    b_Disp(v) = ∫(v ⋅ f)fem_params.dΓ_Load
    op_Disp = AffineFEOperator(a_Disp ,b_Disp ,fem_params.U0_Disp ,fem_params.V0_Disp)
    uh_out = solve(op_Disp)
    return  get_free_dof_values(uh_out)
end 

function MatrixOf(fem_params)

    return assemble_matrix(fem_params.U0_Disp, fem_params.V0_Disp) do u, v
             0.5*∫((∇(u))' ⊙ (C_mat ⊙ ∇(v)))fem_params.dΩ
    end
end

elemsize = 0.75
r = (3*elemsize)/(2*sqrt(3)) #0.025           # Filter radius
β = 4                       # β∈[1,∞], threshold sharpness
η = 0.5                     # η∈[0,1], threshold center

a_f(r, u, v) = r^2 * (∇(v) ⋅ ∇(u))

function Filter(p0; r, fem_params)
    ph = FEFunction(fem_params.P, p0)
    op = AffineFEOperator(fem_params.Pf, fem_params.Qf) do u, v
        ∫(a_f(r, u, v))fem_params.dΩ + ∫(v * u)fem_params.dΩ, ∫(v * ph)fem_params.dΩ
      end
    pfh = solve(op)
    return get_free_dof_values(pfh)
end

function Threshold(pfh; β, η)
    return  ((tanh(β * η) + tanh(β * (pfh - η))) / (tanh(β * η) + tanh(β * (1.0 - η)))) 

end 

NO_FIELDS = ZeroTangent() 

Dptdpf(pf, β, η) = β * (1.0 - tanh(β * (pf - η))^2) / (tanh(β * η) + tanh(β * (1.0 - η))) # Gradient of thresholding function 
DEdpf(pf, β, η)= penal * ((Threshold(pf; β, η)) ^ (penal-1)) * Dptdpf(pf, β, η) # Gradient of density^penal
DAdpf(u, v, pfh; β, η) = ((p->DEdpf(p, β, η)) ∘ pfh) * (ε(v) ⊙ (σfun∘(ε(u)))); 

# Comment/Uncomment for FEA Analysis 
p0 = ones(fem_params.np)
pf_vec = Filter(p0;r, fem_params)
pfh = FEFunction(fem_params.Pf, pf_vec)
pth = (pf -> Threshold(pf; β, η)) ∘ pfh
A_mat = MatrixA(pth; fem_params)
u_vec = stepDisp(fem_params,pth)
uh = FEFunction(fem_params.U0_Disp, u_vec)

function gf_pf(pf_vec; β, η, fem_params)
    pfh = FEFunction(fem_params.Pf, pf_vec)
    pth = (pf -> Threshold(pf; β, η)) ∘ pfh
    u_vec = stepDisp(fem_params,pth)
    K_mat = MatrixOf(fem_params)
    u_vec' * K_mat * u_vec
end 

function rrule(::typeof(gf_pf), pf_vec; β, η, fem_params)
    function U_Disp_pullback(dg)
      NO_FIELDS, dg * Dgfdpf(pf_vec; β, η, fem_params) 
    end
    gf_pf(pf_vec; β, η, fem_params), U_Disp_pullback
end

function Dgfdpf(pf_vec; β, η, fem_params)
    pfh = FEFunction(fem_params.Pf, pf_vec)
    pth = (pf -> Threshold(pf; β, η)) ∘ pfh
    A_mat = MatrixA(pth; fem_params)
    u_vec = stepDisp(fem_params,pth)
    O_mat = MatrixOf(fem_params)
    uh = FEFunction(fem_params.U0_Disp, u_vec)
    w_vec =  A_mat' \ (O_mat * u_vec)
    wconjh = FEFunction(fem_params.U0_Disp, w_vec)
    l_temp(dp) = ∫(-2*DAdpf(wconjh,uh, pfh; β, η) * dp)fem_params.dΩ
    dgfdpf = assemble_vector(l_temp, fem_params.Pf)

    return dgfdpf
end 

function pf_p0(p0; r, fem_params)
    pf_vec = Filter(p0; r, fem_params)
    pf_vec
end

function rrule(::typeof(pf_p0), p0; r, fem_params)
  function pf_pullback(dgdpf)
    NO_FIELDS, Dgdp(dgdpf; r, fem_params)
  end
  pf_p0(p0; r, fem_params), pf_pullback
end

function Dgdp(dgdpf; r, fem_params)
    Af = assemble_matrix(fem_params.Pf, fem_params.Qf) do u, v
        ∫(a_f(r, u, v))fem_params.dΩ + ∫(v * u)fem_params.dΩ
    end
    wvec = Af' \ dgdpf
    wh = FEFunction(fem_params.Pf, wvec)
    l_temp(dp) = ∫(wh * dp)fem_params.dΩ
    return assemble_vector(l_temp, fem_params.P)
end 

function gf_p(p0::Vector; r, β, η, fem_params)
    pf_vec = pf_p0(p0; r, fem_params)
    gf_pf(pf_vec; β, η, fem_params)
end

function gf_p(p0::Vector, grad::Vector; r, β, η, fem_params)
    if length(grad) > 0
        dgdp, = Zygote.gradient(p -> gf_p(p; r, β, η, fem_params), p0)
        grad[:] = dgdp
    end
    gvalue = gf_p(p0::Vector; r, β, η, fem_params)
    open("gvaluemma.txt", "a") do io
        write(io, "$gvalue \n")
    end
    gvalue
end; 

dv=get_array(∫(1)fem_params.dΩ)
getpoints = get_cell_points(Ω)

gradc = zeros(fem_params.np)
function cf_p(p0::Vector, gradc::Vector; r, β, η, fem_params)
    if length(gradc) > 0
        gradc[:] = dv
    end
    pf_vec = pf_p0(p0; r, fem_params)
    pfh = FEFunction(fem_params.Pf, pf_vec)
    pth = (pf -> Threshold(pf; β, η)) ∘ pfh
    pthxtr = evaluate(pfh⊙dv,getpoints)
    return sum(pthxtr)[1] - volfrac*sum(dv)
end; 

function gf_p_optimize(p_init; r, β, η, TOL=1e-4, MAX_ITER, fem_params)
    ##################### Optimize #################
    opt = Opt(:LD_MMA, fem_params.np)
    opt.lower_bounds = 0.001
    opt.upper_bounds = 1
    opt.xtol_rel = TOL
    opt.maxeval = MAX_ITER
    opt.min_objective = (p0, grad) -> gf_p(p0, grad; r, β, η, fem_params)
    inequality_constraint!(opt, (p0, gradc) -> cf_p(p0, gradc; r, β, η, fem_params), 1e-8)
    (g_opt, p_opt, ret) = optimize(opt, p_init)
    return g_opt, p_opt

end

grad = zeros(fem_params.np)

p_opt = fill(volfrac, fem_params.np)   # Uniform Initial guess
g_opt = 0

TOL = 1e-5 # tolerance of the MMA 

g_opt, p_opt = gf_p_optimize(p_opt; r, β, η, TOL, MAX_ITER, fem_params);


βpost=64
function Thresholdp(pfh; βpost, η)
    return ((tanh(βpost * η) + tanh(βpost * (pfh - η))) / (tanh(βpost * η) + tanh(βpost * (1.0 - η)))) 
end 

pf_vec = pf_p0(p_opt; r, fem_params)
pfh = FEFunction(fem_params.Pf, pf_vec)
pth = (pf -> Thresholdp(pf; βpost, η)) ∘ pfh; 

fig, ax, plt = plot(fem_params.Ω, pth, colormap = :binary)
Colorbar(fig[1,2], plt)
ax.aspect = AxisAspect(3)
ax.title = "Optimized Design"
limits!(ax, 0, 60, 0, 20)
save("result.png", fig)