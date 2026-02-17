import {useEffect} from "react"

export default function LoadLocationInput({
    loadLocation,
    setLoadLocation,
    beamType,
    length,
    height
})
{
    let min;
    let max;
    const divisions = 10.0

    if (beamType === "cantilever") {
        min = 0
        max = height
    } else {
        min = length / divisions
        max = length
    }
    const step = max / divisions

    useEffect(() => {
        if (beamType === "cantilever")
        {
            setLoadLocation(height / 2.0);
        } 
        else if( beamType === "half-mbb")
        {
            setLoadLocation(length / 2.0);
        }
    }, [beamType, length, height, setLoadLocation]);

    return (
        <>
            <label htmlFor="load-location" className="form-label">
                <p className='controlText lastRun'>
                    Load Location Ratio &isin; [{min}, {max}], &Delta;={step}:
                </p>
                <strong>{loadLocation}</strong>
            </label>
            <input
                className="form-range"
                type="range"
                name="load"
                min={min} max={max} step={step}
                value={loadLocation}
                onChange={(e)=>setLoadLocation(Number(e.target.value))}
            />
        </>
    )
}