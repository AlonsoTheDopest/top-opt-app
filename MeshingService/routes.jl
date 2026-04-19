using Genie.Router, Genie.Requests, Genie.Responses
using HTTP
include("./lib/MeshUtilities.jl")

function sendFile(filepath)
  file_bytes = read(filepath)

  return HTTP.Response(
    200,
    [
      "Content-Type" => "application/octet-stream",
      "Content-Disposition" => "attachment; filename=mesh.msh"
    ],
    file_bytes
  )
end

route("/") do
  serve_static_file("welcome.html")
end

route("/mesh", method=POST) do 
  args = params(:JSON_PAYLOAD)

  @show "Here"
  length = Float64(args["length"])
  height = Float64(args["height"])
  load_edge = String(args["loadEdge"])
  load_location = Float64(args["loadLocation"])

  filepath = createBeamMesh(length, height, "", load_edge, load_location)

  return sendFile(filepath)
end