using Genie.Router, Base64
using Genie.Renderer.Json: json
# route("/") do
#   serve_static_file("welcome.html")
# end

route( "/run-top-opt", method = POST ) do
    top_opt_args = params(:JSON_PAYLOAD)

    println( top_opt_args )

    length = Float64( top_opt_args["length"] )
    height = Float64( top_opt_args["height"] )
    beam_type = String( top_opt_args["beamType"] )
    load = Float64( top_opt_args["load"] )
    volume_fraction = Float64( top_opt_args["volumeFraction"] )
    iterations = Integer( top_opt_args["iterations"] )
    load_position = Float64( top_opt_args["loadLocation"] )

    topology_optimization_driver( length, 
                                  height, 
                                  beam_type, 
                                  load, 
                                  volume_fraction, 
                                  iterations, 
                                  load_position )

    image_path = "result.png"
    encoded_image = ""

    # Check if the image was actually created
    if isfile(image_path)
        # 1. Open the file and encode it to Base64 text
        open(image_path) do file
            encoded_image = base64encode(read(file))
        end

        # 2. Add the browser prefix so React knows it's an image
        image_data_string = "data:image/png;base64,$(encoded_image)"

        # 3. Return the JSON response with the image data
        return json(Dict(
            "status" => "success",
            "image" => image_data_string  # <--- This is the key part!
        ))
    else
        # Error handling if the image wasn't found
        return json(Dict(
            "status" => "error",
            "message" => "Image file not generated."
        ))
    end

    println( "\n\n\nEnd Program" )
end 