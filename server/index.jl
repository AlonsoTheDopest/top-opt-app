using Genie, Genie.Renderer.Html, Genie.Requests

route("/run-top-opt", method = POST ) do

    payload = jsonpayload()

    beamType = payload["beamType"]
    load = payload["load"]
    volumeFraction = payload["volumeFraction"]
    iterations = payload["iterations"]

    if beamType == "cantilever"
        println( "Running cantilever beam optimization" )
    else # beamType == "half-mmb"
        println( "Running half MMB beam optimization" )
    end

end

up( 8081, async = false )