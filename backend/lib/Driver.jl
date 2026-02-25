# Driver.jl

using Gridap.TensorValues

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
    createBeamMesh(length, height, beamtype, load_edge, load_position)

    # TODO: If anyone is brave enough to refactor the top-opt.jl file as
    #       function calls, instead of making these variables globals, go crazy.
    #       Time wasted: 25 hrs
    global f, volfrac, MAX_ITER, beam_type, result_image_path, elemsize, l, h, direchlet_masks, direchlet_tags

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

    include( "./top-opt.jl" )


    return result_image_path
end