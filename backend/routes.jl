using Genie.Router

route("/") do
  serve_static_file("welcome.html")
end

route( "/run-top-opt", method = POST ) do
    top_opt_args = params(:JSON_PAYLOAD)

    println( top_opt_args )

    length = Float64( top_opt_args["length"] )
    height = Float64( top_opt_args["height"] )
    beam_type = String( top_opt_args["beam_type"] )
    load = Float64( top_opt_args["load"] )
    volume_fraction = Float64( top_opt_args["volume_fraction"] )
    iterations = Integer( top_opt_args["iterations"] )
    load_position = Float64( top_opt_args["load_position"] )

    topology_optimization_driver( length, 
                                  height, 
                                  beam_type, 
                                  load, 
                                  volume_fraction, 
                                  iterations, 
                                  load_position )

    println( "\n\n\nEnd Program" )
end 