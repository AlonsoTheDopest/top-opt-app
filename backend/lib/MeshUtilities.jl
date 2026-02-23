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
    load_edge::String,
    load_position::Float64
)::String
    mesh_file_name = ""
    gmsh.initialize()
    if gmsh.isInitialized() == 1
        gmsh.option.setNumber("Mesh.Algorithm", 6)
        createBeam(length, height, beam_type, load_edge, load_position)
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
    load_edge::String,
    load_position::Float64
)
    ptsVec = addPoints(length, height, load_edge, load_position)
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
    load_edge::String,
    load_position::Float64 
)

    mesh_size = calculateMeshSize(length)

    bottomLeftPt, bottomRightPt, topRightPt, topLeftPt = addCornerPoints( length, height, mesh_size )
    corner_pts = [ bottomLeftPt, bottomRightPt, topRightPt, topLeftPt ]

    loadLinePt1, loadLinePt2 = addLoadLinePoints( 
        length,
        height,
        mesh_size, 
        load_edge, 
        load_position 
    );
    load_line_pts = [ loadLinePt1, loadLinePt2 ];

    ptsVec = assemblePtsVec(corner_pts, load_line_pts, load_edge)
    
    return ptsVec
end


function assemblePtsVec(cornerPtsVec, loadLinePtsVec, load_edge)
    ptsVec = []

    if load_edge == "right"
        append!(ptsVec, cornerPtsVec[1:2]);
        append!(ptsVec, loadLinePtsVec);
        append!(ptsVec, cornerPtsVec[3:4]);

    elseif load_edge == "top"
        append!(ptsVec, cornerPtsVec[1:3]);
        append!(ptsVec, loadLinePtsVec[2]);
        append!(ptsVec, loadLinePtsVec[1]);
        append!(ptsVec, cornerPtsVec[4]);

    elseif load_edge == "left"
        append!(ptsVec, cornerPtsVec);
        append!(ptsVec, loadLinePtsVec[2]);
        append!(ptsVec, loadLinePtsVec[1]);

    else # bottom
        append!(ptsVec, cornerPtsVec[1]);
        append!(ptsVec, loadLinePtsVec);
        append!(ptsVec, cornerPtsVec[2:4]);
    end

    return ptsVec;
end


function getLoadLinePointPositions(load_position, edge_length, offset = 0.1)
    pt1_position = load_position - offset;
    pt2_position = load_position + offset;

    if pt2_position >= edge_length
        pt2_position = edge_length - offset
        pt1_position = pt2_position - 2.0 * offset

    elseif pt1_position <= 0.0
        pt1_position = offset
        pt2_position = pt1_position + 2.0 * offset
    end

    return pt1_position, pt2_position
end


function addLoadLinePoints( 
    length::Float64, 
    height::Float64, 
    mesh_size::Float64,
    load_edge::String,
    load_position::Float64 
)
    if load_edge == "right" || load_edge == "left"
        bottom_pt_position, top_pt_position = getLoadLinePointPositions(load_position, height)

        load_line_pt1 = addPoint(length, bottom_pt_position, 0.0, mesh_size)
        load_line_pt2 = addPoint(length, top_pt_position, 0.0, mesh_size)
        
    elseif load_edge == "top" || load_edge == "bottom"
        left_pt_position, right_pt_position = getLoadLinePointPositions(load_position, length)

        load_line_pt1 = addPoint(left_pt_position, height, 0.0, mesh_size)
        load_line_pt2 = addPoint(right_pt_position, height, 0.0, mesh_size)
    end

    return load_line_pt1, load_line_pt2
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


function loadBeamMesh(file_name::String, beam_type::String)
    model = GmshDiscreteModel(file_name)
    writevtk(model, beam_type)
    return model
end

export createBeamMesh