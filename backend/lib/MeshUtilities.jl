# MeshUtilities.jl

using Gmsh: gmsh, gmsh.model.geo.addPoint, gmsh.model.geo.addLine

function calculateMeshSize(length::Float64)
    return length / 160.0
end

function createBeamMesh( length::Float64, height::Float64, beam_type::String, load_position::Float64 )
    gmsh.initialize()
    if gmsh.isInitialized() == 1
        gmsh.option.setNumber("Mesh.Algorithm", 6) # Frontal-Delaunay for 2D
        createBeam(length, height, beam_type, load_position)
        gmsh.model.mesh.generate(2)
        gmsh.write("./mesh.msh")
        gmsh.finalize()
        return "./mesh.msh"
    end
    return ""
end


function createBeam( length::Float64, height::Float64, beam_type::String, load_position::Float64 )
    ptsVec = addPoints( length, height, beam_type, load_position )

    linesVec = addLines( ptsVec )

    area = addArea( linesVec )

    addPhysicalGroups( linesVec, area, beam_type )
end


function addPhysicalGroups( linesVec, area, beam_type::String )
    gmsh.model.geo.synchronize()

    domainPhysGroup = gmsh.model.addPhysicalGroup( 2, [ area ] )
    gmsh.model.setPhysicalName( 2, domainPhysGroup, "Domain" )

    if beam_type == "cantilever"
        loadLine = linesVec[ 3 ]
        leftLine = linesVec[ end ]

        loadLinePhysGroup = gmsh.model.addPhysicalGroup( 1, [ loadLine ] )
        gmsh.model.setPhysicalName( 1, loadLinePhysGroup, "LoadLine" )

        leftSupportPhysGroup = gmsh.model.addPhysicalGroup( 1, [ leftLine ] )
        gmsh.model.setPhysicalName( 1, leftSupportPhysGroup, "LeftSupport" )

    else # Half-MBB

        rightline = linesVec[ 2 ]
        loadLine = linesVec[ 4 ]
        leftLine = linesVec[ end ]

        rightSupportPhysGroup = gmsh.model.addPhysicalGroup( 1, [ rightline ] )
        gmsh.model.setPhysicalName( 1, rightSupportPhysGroup, "RightSupport")

        loadLinePhysGroup = gmsh.model.addPhysicalGroup( 1, [ loadLine ] )
        gmsh.model.setPhysicalName( 1, loadLinePhysGroup, "LoadLine" )

        leftSupportPhysGroup = gmsh.model.addPhysicalGroup( 1, [ leftLine ] )
        gmsh.model.setPhysicalName( 1, leftSupportPhysGroup, "LeftSupport" )
    end
end

function addArea( linesVec )

    curveLoop = gmsh.model.geo.addCurveLoop( linesVec )
    area = gmsh.model.geo.addPlaneSurface( [ curveLoop ] )

    return area
end


function addPoints( length::Float64, height::Float64, beam_type::String, load_position::Float64 )

    mesh_size = calculateMeshSize( length )

    bottomLeftPt, bottomRightPt, topRightPt, topLeftPt = addCornerPoints( length, height, mesh_size )
    cornerPtsVec = [ bottomLeftPt, bottomRightPt, topRightPt, topLeftPt ]

    loadLinePt1, loadLinePt2 = addLoadLinePoints( length, height, beam_type, mesh_size, load_position )
    loadLinePtsVec = [ loadLinePt1, loadLinePt2 ]

    ptsVec = assemblePtsVec( cornerPtsVec, loadLinePtsVec, beam_type )
    
    return ptsVec
end


function assemblePtsVec( cornerPtsVec, loadLinePtsVec, beam_type::String )
    ptsVec = []

    if beam_type == "cantilever"
        append!( ptsVec, cornerPtsVec[ 1 : 2 ] )
        append!( ptsVec, loadLinePtsVec )
        append!( ptsVec, cornerPtsVec[ 3 : 4 ] )

    else # Half-MBB
        append!( ptsVec, cornerPtsVec[ 1 : 3 ] )
        append!( ptsVec, loadLinePtsVec )
        append!( ptsVec, cornerPtsVec[ 4 ] )
    end

    return ptsVec
end


function addLoadLinePoints( length::Float64, 
                            height::Float64, 
                            beam_type::String, 
                            mesh_size::Float64,
                            load_position::Float64 )
    if beam_type == "cantilever"
        loadLinePt1, loadLinePt2 = addCantileverPoints( length, height, mesh_size, load_position )
        
    elseif beam_type == "half-mbb"
        loadLinePt1, loadLinePt2 = addHalfMbbPoints( length, height, mesh_size, load_position )
    end

    return loadLinePt1, loadLinePt2
end


function addLines( ptsVec )
    lines = []

    numPts = length( ptsVec )

    for idx in 1 : numPts
        startPtIdx = idx
        endPtIdx = mod1( idx + 1, numPts )

        startPt = ptsVec[ startPtIdx ]
        endPt = ptsVec[ endPtIdx ]

        push!( lines, addLine( startPt, endPt ) )
    end

    return lines
end


function addCornerPoints( length::Float64, height::Float64, mesh_size::Float64 )
    bottomLeftPt = addPoint( 0.0, 0.0, 0.0, mesh_size )
    bottomRightPt = addPoint( length, 0.0, 0.0, mesh_size )
    topRightPt = addPoint( length, height, 0.0, mesh_size )
    topLeftPt = addPoint( 0.0, height, 0.0, mesh_size )

    return bottomLeftPt, bottomRightPt, topRightPt, topLeftPt
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


function addHalfMbbPoints( length::Float64, height::Float64, mesh_size, load_position::Float64 )
    offset = 0.1
    topSideLeftPtLength = load_position - offset
    topSideRightPtLength = load_position + offset

    if topSideLeftPtLength <= 0.0
        topSideLeftPtLength = offset
        topSideRightPtLength = topSideLeftPtLength + 2.0 * offset

    elseif topSideRightPtLength >= length
        topSideRightPtLength = length - offset
        topSideLeftPtLength = topSideLeftPtLength - 2.0 * offset
    end

    topSideLeftPt = addPoint( topSideLeftPtLength, height, 0.0, mesh_size )
    topSideRightPt = addPoint( topSideRightPtLength, height, 0.0, mesh_size )

    return topSideRightPt, topSideLeftPt
end

function loadBeamMesh( file_name::String, beam_type::String )
    model = GmshDiscreteModel( file_name )
    writevtk(model , beam_type )
    return model
end

export createBeamMesh