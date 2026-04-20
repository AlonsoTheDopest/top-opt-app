using Genie.Router, Genie.Requests, Genie.Responses
using Genie.Renderer.Json: json
using HTTP
include("./lib/MeshUtilities.jl")
include("app/resources/meshs/Meshs.jl")
using .Meshs:Mesh

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

route("/meshes") do 
  meshes = all(Mesh)
  return json(meshes)
end

route("/mesh", method=POST) do 
  args = params(:JSON_PAYLOAD)

  length = Float64(args["length"])
  height = Float64(args["height"])
  load_edge = String(args["loadEdge"])
  load_location = Float64(args["loadLocation"])

  mesh = Mesh(
    length=length,
    height=height,
    load_edge=load_edge,
    load_location=load_location
  ) |> save!

  filepath = createBeamMesh(length, height, "", load_edge, load_location)

  return sendFile(filepath)
end