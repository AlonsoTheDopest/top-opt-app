# MeshUtilities.jl

using Gmsh: gmsh, gmsh.model.geo.addPoint, gmsh.model.geo.addLine

const ZERO_DIM = 0;
const ONE_DIM = 1;
const TWO_DIM = 2;

function calculateMeshSize(length::Float64)
    return length / 160.0
end

function createBeamMesh(
    length::Float64, 
    height::Float64, 
    beam_type::String, 
    load_position::Float64
)::String
    mesh_file_name = ""
    gmsh.initialize()
    if gmsh.isInitialized() == 1
        gmsh.option.setNumber("Mesh.Algorithm", 6)
        createBeam(length, height, beam_type, load_position)
        gmsh.model.mesh.generate(TWO_DIM)
        gmsh.write("./mesh.msh")
        gmsh.finalize()
        mesh_file_name = "./mesh.msh"
    end
    return mesh_file_name
end


function createBeam(
    length::Float64,
    height::Float64,
    beam_type::String,
    load_position::Float64
)
    ptsVec = addPoints(length, height, beam_type, load_position)
    linesVec = addLines(ptsVec)
    area = addArea(linesVec)
    addPhysicalGroups(ptsVec, linesVec, area, beam_type)
end


function addPhysicalGroups(ptsVec, linesVec, area, beam_type::String)
    gmsh.model.geo.synchronize()

    domainPhysGroup = gmsh.model.addPhysicalGroup(TWO_DIM, [area])
    gmsh.model.setPhysicalName(TWO_DIM, domainPhysGroup, "Domain")

    if beam_type == "cantilever" || beam_type == "general"
        loadLine = linesVec[3]
        leftLine = linesVec[end]

        loadLinePhysGroup = gmsh.model.addPhysicalGroup(ONE_DIM, [loadLine])
        gmsh.model.setPhysicalName(ONE_DIM, loadLinePhysGroup, "LoadLine")

        leftSupportPhysGroup = gmsh.model.addPhysicalGroup(ONE_DIM, [leftLine])
        gmsh.model.setPhysicalName(ONE_DIM, leftSupportPhysGroup, "LeftSupport")

    else # Half-MBB
        bottom_right_pt = ptsVec[2]
        loadLine = linesVec[4]
        leftLine = linesVec[end]

        rightSupportPhysGroup = gmsh.model.addPhysicalGroup(ZERO_DIM, [bottom_right_pt])
        gmsh.model.setPhysicalName(ZERO_DIM, rightSupportPhysGroup, "RightSupport")

        loadLinePhysGroup = gmsh.model.addPhysicalGroup(ONE_DIM, [loadLine])
        gmsh.model.setPhysicalName(ONE_DIM, loadLinePhysGroup, "LoadLine")

        leftSupportPhysGroup = gmsh.model.addPhysicalGroup(ONE_DIM, [leftLine])
        gmsh.model.setPhysicalName(ONE_DIM, leftSupportPhysGroup, "LeftSupport")
    end
end

function addArea(linesVec)
    curveLoop = gmsh.model.geo.addCurveLoop(linesVec)
    area = gmsh.model.geo.addPlaneSurface([curveLoop])
    return area
end


function addPoints(
    length::Float64, 
    height::Float64, 
    beam_type::String, 
    load_position::Float64 
)

    mesh_size = calculateMeshSize(length)

    bottomLeftPt, bottomRightPt, topRightPt, topLeftPt = addCornerPoints( length, height, mesh_size )
    corner_pts = [ bottomLeftPt, bottomRightPt, topRightPt, topLeftPt ]

    loadLinePt1, loadLinePt2 = addLoadLinePoints( length, height, beam_type, mesh_size, load_position )
    load_line_pts = [ loadLinePt1, loadLinePt2 ]

    ptsVec = assemblePtsVec( corner_pts, load_line_pts, beam_type )
    
    return ptsVec
end


function assemblePtsVec( cornerPtsVec, loadLinePtsVec, beam_type::String )
    ptsVec = []

    if beam_type == "cantilever" || beam_type == "general"
        append!(ptsVec, cornerPtsVec[1:2])
        append!(ptsVec, loadLinePtsVec)
        append!(ptsVec, cornerPtsVec[3:4])

    else # Half-MBB
        append!(ptsVec, cornerPtsVec[1:3])
        append!(ptsVec, loadLinePtsVec)
        append!(ptsVec, cornerPtsVec[4])
    end

    return ptsVec
end


function addLoadLinePoints( length::Float64, 
                            height::Float64, 
                            beam_type::String, 
                            mesh_size::Float64,
                            load_position::Float64 )
    if beam_type == "cantilever" || beam_type == "general"
        loadLinePt1, loadLinePt2 = addCantileverPoints( length, height, mesh_size, load_position )
        
    elseif beam_type == "half-mbb"
        loadLinePt1, loadLinePt2 = addHalfMbbPoints( length, height, mesh_size, load_position )
    end

    return loadLinePt1, loadLinePt2
end


function addLines(ptsVec)
    lines = []
    numPts = length(ptsVec)

    for idx in 1 : numPts
        startPtIdx = idx
        endPtIdx = mod1(idx + 1, numPts)

        startPt = ptsVec[startPtIdx]
        endPt = ptsVec[endPtIdx]

        push!(lines, addLine(startPt, endPt))
    end

    return lines
end


function addCornerPoints(length::Float64, height::Float64, mesh_size::Float64)
    bottom_left = addPoint(0.0, 0.0, 0.0, mesh_size)
    bottom_right = addPoint(length, 0.0, 0.0, mesh_size)
    top_right = addPoint(length, height, 0.0, mesh_size)
    top_left = addPoint(0.0, height, 0.0, mesh_size)
    return bottom_left, bottom_right, top_right, top_left
end


function addCantileverPoints( length::Float64, height::Float64, mesh_size, load_position )
    offset = 0.1
    rightSideTopPtHeight = load_position + offset
    rightSideBottomPtHeight = load_position - offset

    if rightSideTopPtHeight >= height
        rightSideTopPtHeight = height - offset
        rightSideBottomPtHeight = rightSideTopPtHeight - 2.0 * offset

    elseif rightSideBottomPtHeight <= 0.0
        rightSideBottomPtHeight = offset
        rightSideTopPtHeight = rightSideBottomPtHeight + 2.0 * offset
    end

    rightSideTopPt = addPoint( length, rightSideTopPtHeight, 0.0, mesh_size )
    rightSideBottomPt = addPoint( length, rightSideBottomPtHeight, 0.0, mesh_size )

    return rightSideBottomPt, rightSideTopPt
end 


function addHalfMbbPoints(
    length::Float64, 
    height::Float64, 
    mesh_size, 
    load_position::Float64
)
    offset = 0.1
    left_load_line_pt_pos = load_position - offset
    right_load_line_pt_pos = load_position + offset

    if left_load_line_pt_pos <= 0.0
        left_load_line_pt_pos = offset
        right_load_line_pt_pos = left_load_line_pt_pos + 2.0 * offset

    elseif right_load_line_pt_pos >= length
        right_load_line_pt_pos = length - offset
        left_load_line_pt_pos = left_load_line_pt_pos - 2.0 * offset
    end

    left_load_line_pt = addPoint(left_load_line_pt_pos, height, 0.0, mesh_size)
    right_load_line_pt = addPoint(right_load_line_pt_pos, height, 0.0, mesh_size)

    return right_load_line_pt, left_load_line_pt
end


function loadBeamMesh(file_name::String, beam_type::String)
    model = GmshDiscreteModel(file_name)
    writevtk(model, beam_type)
    return model
end

export createBeamMesh