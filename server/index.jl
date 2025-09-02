using Genie, Genie.Renderer.Html, Genie.Requests

route("/run-top-opt") do
    beamType = getpayload( :beamType, "Cantilever" )
    load = parse( Float64, getpayload( :load, "1.0" ) )
    volumeFraction = parse( Float64, getpayload( :volumeFraction, "0.9" ) )
    iterations = parse( Int, getpayload( :iterations, "5000" ) )
    
    

end

up( 8081, async = false )