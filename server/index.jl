using Genie, Genie.Renderer.Html, Genie.Requests

route("/run-top-opt") do
    params( :beamType, :load, :volumeFraction, :iterations )
    html("Running optimization")
end

up( 8081, async = false )