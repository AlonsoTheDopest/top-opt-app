export default function BeamTypeInput({ 
    beamType, 
    setBeamType, 
    setLoadLocation,
    length,
    height
})
{
    const handleBeamTypeChange = ( e ) => {
        setBeamType( e.target.value )
        if ( beamType === "cantilever" )
        {
            setLoadLocation( height / 2.0 )
        }
        else if ( beamType === "half-mbb" )
        {
            setLoadLocation( length / 2.0 )
        }
    }

    return (
        <>
            <label htmlFor="beam-type" className="form-label large-control-label"><p className='controlText'>Beam Type:</p></label>
            <select 
                name="beam-type" 
                className="form-select beam-type-select large-control-input"
                value={beamType} 
                onChange={ ( e ) => handleBeamTypeChange( e )} 
            >
                <option value="cantilever">Cantilever</option>
                <option value="half-mbb">Half MBB</option>
            </select>
        </>
    )
}