# MeshUtilities.jl

using Gmsh: gmsh, gmsh.model.geo.addPoint, gmsh.model.geo.addLine

const ZERO_DIM = 0;
const ONE_DIM = 1;
const TWO_DIM = 2;
const OFFSET = 0.1

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
        createBeam(length, height, load_edge, load_position)
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
    load_edge::String,
    load_position::Float64
)
    ptsVec = addPoints(length, height, load_edge, load_position)
    linesVec = addLines(ptsVec)
    area = addArea(linesVec)
    addPhysicalGroups(area, length, height);
end


function isBottomLeftCorner(x, y)
    return x == 0.0 && y == 0.0
end

function isBottomRightCorner(x, y, length)
    return x == length && y == 0.0
end

function isTopRightCorner(x, y, length, height)
    return x == length && y == height
end


function isTopLeftCorner(x, y, height)
    return x == 0.0 && y == height
end


function getPointPhysicalGroupName(x, y, length, height)
    physical_group_name = ""
    if isBottomLeftCorner(x, y)
        physical_group_name = "BottomLeftCorner"

    elseif isBottomRightCorner(x, y, length)
        physical_group_name = "BottomRightCorner"

    elseif isTopRightCorner(x, y, length, height)
        physical_group_name = "TopRightCorner"

    else # Top Left corner
        physical_group_name = "TopLeftCorner"
    end

    return physical_group_name
end


function addPointsPhysicalGroups(length, height)
    pts = gmsh.model.getEntities(ZERO_DIM)
    for (dim, tag) in pts
        x, y, z = gmsh.model.getValue(dim, tag, [])
        println("Point $tag: ($x, $y, $z)")
        if (x == 0.0 || x == length) && (y == 0.0 || y == height)
            physical_group_name = getPointPhysicalGroupName(x, y, length, height);
            physical_group = gmsh.model.addPhysicalGroup(ZERO_DIM, [tag])
            gmsh.model.setPhysicalName(ZERO_DIM, physical_group, physical_group_name)
        end
    end
end


function isTopSide(x1, y1, x2, y2, length, height)
    return isTopRightCorner(x1, y1, length, height) && isTopLeftCorner(x2, y2, height);
end


function isBottomSide(x1, y1, x2, y2, length)
    return isBottomLeftCorner(x1, y1) && isBottomRightCorner(x2, y2, length);
end


function isRightSide(x1, y1, x2, y2, length, height)
    return isBottomRightCorner(x1, y1, length) && isTopRightCorner(x2, y2, length, height);
end


function isLeftSide(x1, y1, x2, y2, height)
    return isTopLeftCorner(x1, y1, height) && isBottomLeftCorner(x2, y2);
end


function isLoadLine(x1, y1, x2, y2)
    return abs(x1 - x2) ≈ 2 * OFFSET || abs(y1 - y2) ≈ 2 * OFFSET
end


function getLinePhysicalGroupName(x1, y1, x2, y2, length, height)
    physical_group_name = ""
    if isTopSide(x1, y1, x2, y2, length, height)
        println("Has top")
        physical_group_name = "TopSide"

    elseif isBottomSide(x1, y1, x2, y2, length)
        println("Has bottom")
        physical_group_name = "BottomSide"

    elseif isRightSide(x1, y1, x2, y2, length, height)
        println("Has right")
        physical_group_name = "RightSide"

    elseif isLeftSide(x1, y1, x2, y2, height)
        println("Has left")
        physical_group_name = "LeftSide"

    elseif isLoadLine(x1, y1, x2, y2)
        println("Has load line")
        physical_group_name = "LoadLine"
    end

    return physical_group_name
end


function addLinesPhysicalGroups(length, height)
    lines = gmsh.model.getEntities(ONE_DIM)
    for (dim, tag) in lines
        x1, y1, z1, x2, y2, z2 = gmsh.model.getBoundingBox(dim, tag)
        println("Line $tag: ($x1, $y1) to ($x2, $y2)")
        physical_group_name = getLinePhysicalGroupName(x1, y1, x2, y2, length, height)
        if physical_group_name == ""
            physical_group_name = getLinePhysicalGroupName(x2, y2, x1, y1, length, height)
        end

        if physical_group_name != ""
            physical_group = gmsh.model.addPhysicalGroup(dim, [tag])
            gmsh.model.setPhysicalName(dim, physical_group, physical_group_name)
        end
    end
end


function addPhysicalGroups(area, length, height)
    gmsh.model.geo.synchronize()

    domainPhysGroup = gmsh.model.addPhysicalGroup(TWO_DIM, [area]);
    gmsh.model.setPhysicalName(TWO_DIM, domainPhysGroup, "Domain");

    addPointsPhysicalGroups(length, height);
    addLinesPhysicalGroups(length, height);
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

        if load_edge == "right"
            load_line_pt1 = addPoint(length, bottom_pt_position, 0.0, mesh_size)
            load_line_pt2 = addPoint(length, top_pt_position, 0.0, mesh_size)
        else
            load_line_pt1 = addPoint(0.0, bottom_pt_position, 0.0, mesh_size)
            load_line_pt2 = addPoint(0.0, top_pt_position, 0.0, mesh_size)
        end
        
    elseif load_edge == "top" || load_edge == "bottom"
        left_pt_position, right_pt_position = getLoadLinePointPositions(load_position, length)

        if load_edge == "top"
            load_line_pt1 = addPoint(left_pt_position, height, 0.0, mesh_size)
            load_line_pt2 = addPoint(right_pt_position, height, 0.0, mesh_size)
        else
            load_line_pt1 = addPoint(left_pt_position, 0, 0.0, mesh_size)
            load_line_pt2 = addPoint(right_pt_position, 0, 0.0, mesh_size)
        end
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