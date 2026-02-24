using Genie.Router, Base64
using Genie.Renderer.Json: json
include("app/resources/results/Results.jl")
using .Results:Result

function get_encoded_image(image_path::String, image_type::String = "png")
    encoded_image = ""
    if isfile(image_path)
        read_image = read(image_path)
        encoded_image = base64encode(read_image)
        encoded_image = "data:image/$image_type;base64,$encoded_image"
    end
    return encoded_image
end

function get_results()
    results = all(Result)
    return json(results)
end

route("/results", method = GET) do
    return get_results()
end

route( "/run-top-opt", method = POST ) do

    top_opt_args = params(:JSON_PAYLOAD)

    length = Float64(top_opt_args["length"])
    height = Float64(top_opt_args["height"])
    beam_type = String(top_opt_args["beamType"])
    load_edge = String(top_opt_args["loadEdge"])
    load = Float64(top_opt_args["load"])
    volume_fraction = Float64(top_opt_args["volumeFraction"])
    iterations = Integer(top_opt_args["iterations"])
    load_location = Float64(top_opt_args["loadLocation"])
    boundary_conditions = top_opt_args["boundaryConditions"]

    boundaries = String[]
    masks = Tuple{Bool,Bool}[]

    for obj in boundary_conditions
        push!(boundaries, obj["boundary"])
        flags = obj["dofFlags"]
        push!(masks, (flags[1], flags[2]))
    end

    println(boundaries)
    println(masks)  

    image_path = topology_optimization_driver( 
        length, 
        height, 
        beam_type, 
        load_edge,
        load, 
        volume_fraction, 
        iterations, 
        load_location,
        boundaries,
        masks
    )

    encoded_image = get_encoded_image(image_path)
    
    if encoded_image != ""
        result = Result(
            beam_type=beam_type,
            load=load,
            load_location=load_location,
            volume_fraction=volume_fraction,
            iterations=iterations,
            image=encoded_image
        ) |> save!

        return json(Dict(
            "status" => "success",
            "image" => encoded_image
        ))
    else
        return json(Dict(
            "status" => "error",
            "message" => "Image file not generated."
        ))
    end
end 