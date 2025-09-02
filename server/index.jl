using Genie, Genie.Renderer.Html, Genie.Requests

route("/run-top-opt", method = POST ) do

    payload = jsonpayload()

    beamType = payload["beamType"]
    load = payload["load"]
    volumeFraction = payload["volumeFraction"]
    iterations = payload["iterations"]

    println( payload )

    if beamType == "cantilever"
        println( "Running cantilever beam optimization with load = $load, volume fraction = $volumeFraction, iterations = $iterations" )
    else 
        println( "Running half MMB beam optimization with load = $load, volume fraction = $volumeFraction, iterations = $iterations" )
    end

end

up( 8081, async = false )