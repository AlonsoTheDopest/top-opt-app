# Driver.jl

using Gridap.TensorValues, HTTP, JSON3

export topology_optimization_driver

function topology_optimization_driver( 
    length::Float64, 
    height::Float64, 
    beamtype::String, 
    load_edge::String,
    load::Float64, 
    volumefraction::Float64, 
    iterations::Integer,
    load_position::Float64,
    boundaries,
    masks,
    load_angle
)
    #createBeamMesh(length, height, beamtype, load_edge, load_position)

    # TODO: If anyone is brave enough to refactor the top-opt.jl file as
    #       function calls, instead of making these variables globals, go crazy.
    #       Time wasted: 25 hrs
    global f, volfrac, MAX_ITER, beam_type, result_image_path, elemsize, l, h, direchlet_masks, direchlet_tags, mesh_file

    f = VectorValue(load * cosd(load_angle), load * sind(load_angle))
    volfrac = volumefraction
    MAX_ITER = iterations
    beam_type = beamtype
    result_image_path = ""
    elemsize = calculateMeshSize(length)
    l = length;
    h = height;
    direchlet_tags = boundaries
    direchlet_masks = masks

    payload = Dict("length" => length, "height" => height, "loadEdge" => load_edge, "loadLocation" => load_position)
    resp = HTTP.post(
        "http://mesh-utils:8001/mesh",
        ["Content-Type" => "application/json"],
        JSON3.write(payload)
    )
    tmpdir = mktempdir()
    mesh_file = joinpath(tmpdir, "mesh.msh")

    open(mesh_file, "w") do io
        write(io, resp.body)
    end

    include( "./top-opt.jl" )


    return result_image_path
end