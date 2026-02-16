# Driver.jl

using Gridap.TensorValues

export topology_optimization_driver

function topology_optimization_driver( length::Float64, 
                                       height::Float64, 
                                       beamtype::String, 
                                       load::Float64, 
                                       volumefraction::Float64, 
                                       iterations::Integer,
                                       load_position::Float64 )
    createBeamMesh( length, height, beamtype, load_position )

    global f, volfrac, MAX_ITER, beam_type, result_image_path

    f = VectorValue( 0.0, load )
    volfrac = volumefraction
    MAX_ITER = iterations
    beam_type = beamtype
    result_image_path = ""

    include( "./top-opt.jl" )

    println( "\n\n\nEnd Program" )
    return result_image_path
end