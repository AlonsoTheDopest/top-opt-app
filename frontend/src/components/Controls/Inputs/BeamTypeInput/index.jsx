export default function BeamTypeInput({ beamType, setBeamType })
{
    const BEAM_TYPES = [
        {type: "Cantilever", value: "cantilever"},
        {type: "Half MBB", value: "half-mbb"},
        {type: "General", value: "general"},
    ]

    return (
        <>
            <label 
                htmlFor="beam-type" 
                className="form-label large-control-label"
            >
                <p className='controlText'>Beam Type:</p>
            </label>
            <select 
                name="beam-type" 
                className="form-select beam-type-select large-control-input"
                value={beamType} 
                onChange={e => setBeamType(e.target.value)} 
            >
                {BEAM_TYPES.map(item => (
                    <option value={item.value}>{item.type}</option>
                ))}
            </select>
        </>
    )
}