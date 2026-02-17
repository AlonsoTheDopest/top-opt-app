export default function BeamTypeInput({ beamType, setBeamType })
{
    return (
        <>
            <label htmlFor="beam-type" className="form-label large-control-label">
                <p className='controlText'>Beam Type:</p>
            </label>
            <select 
                name="beam-type" 
                className="form-select beam-type-select large-control-input"
                value={beamType} 
                onChange={ ( e ) => setBeamType( e.target.value )} 
            >
                <option value="cantilever">Cantilever</option>
                <option value="half-mbb">Half MBB</option>
            </select>
        </>
    )
}