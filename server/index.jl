# using Genie, Genie.Renderer.Html, Genie.Requests

# route("/run-top-opt", method = POST ) do

#     payload = jsonpayload()

#     beamType = payload["beamType"]
#     load = payload["load"]
#     volumeFraction = payload["volumeFraction"]
#     iterations = payload["iterations"]

#     if beamType == "cantilever"
#         println( "Running cantilever beam optimization" )
#         include( "./cantilever/CantileverBeaOptimization.jl" )
#     else # beamType == "half-mmb"
#         println( "Running half MMB beam optimization" )
#     end

# end

# up( 8081, async = false )

using Genie, Genie.Renderer.Html, Genie.Requests
using JSON3
include("./cantilever/CantileverBeamOptimization.jl")
using .MySIMP

# -------------------------------------------------
# Define API endpoint
# -------------------------------------------------
route("/run-top-opt", method = POST) do
    try
        # Parse JSON payload
        payload = jsonpayload()

        beamType = payload["beamType"]
        load = payload["load"]               # currently unused, can be extended later
        volumeFraction = payload["volumeFraction"]
        iterations = payload["iterations"]

        println("Received request:")
        println("  beamType = $beamType")
        println("  load = $load")
        println("  volumeFraction = $volumeFraction")
        println("  iterations = $iterations")

        # -------------------------------------------------
        # Case 1: Cantilever beam topology optimization
        # -------------------------------------------------
        if beamType == "cantilever"
            println(">>> Running Cantilever Beam Optimization...")

            # 1️⃣ Create or reuse mesh
            mesh_file = "./cantilever/meshes/mesh.msh"
            if !isfile(mesh_file)
                println("Generating mesh...")
                MySIMP.create_mesh(mesh_file)
            else
                println("Using existing mesh file.")
            end

            # 2️⃣ Load mesh into Gridap model
            println("Loading model...")
            model = MySIMP.load_model(mesh_file)

            # 3️⃣ Setup finite element spaces
            fem_params = MySIMP.setup_fem(model)

            # 4️⃣ Run MMA optimization
            g_opt, p_opt = MySIMP.optimize_topology(
                fem_params;
                r = 0.3,
                β = 4.0,
                η = 0.5,
                volfrac = volumeFraction,
                TOL = 1e-5,
                MAX_ITER = iterations
            )

            # 5️⃣ Generate final plot and output files
            result_file = MySIMP.plot_result(
                fem_params,
                p_opt;
                r = 0.3,
                βpost = 64,
                η = 0.5,
                filename = "result_image.png"
            )

            # Return success response with result info
            return JSON3.write(Dict(
                "status" => "success",
                "beamType" => beamType,
                "volumeFraction" => volumeFraction,
                "iterations" => iterations,
                "compliance" => g_opt,
                "resultImage" => result_file
            ))

        # -------------------------------------------------
        # Case 2: Half MMB beam (not yet implemented)
        # -------------------------------------------------
        elseif beamType == "half-mmb"
            println(">>> Running Half-MMB Beam Optimization (not implemented yet)")
            return JSON3.write(Dict(
                "status" => "pending",
                "beamType" => beamType,
                "message" => "Half-MMB optimization not yet implemented."
            ))
        else
            return JSON3.write(Dict(
                "status" => "error",
                "message" => "Invalid beamType. Expected 'cantilever' or 'half-mmb'."
            ))
        end

    catch e
        # Handle any unexpected error
        @error "Optimization failed: $e"
        return JSON3.write(Dict(
            "status" => "error",
            "message" => string(e)
        ))
    end
end

# -------------------------------------------------
# Launch the Genie server
# -------------------------------------------------
up(8081, async = false)
