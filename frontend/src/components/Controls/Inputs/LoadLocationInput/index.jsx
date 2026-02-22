import {useEffect} from "react"

export default function LoadLocationInput({
    loadLocation,
    setLoadLocation,
    beamType,
    length,
    height
})
{
    const min = 0
    let max
    const divisions = 10.0
    let positionVariable

    if (beamType === "cantilever") {
        max = height
        positionVariable = "h"
    } else {
        max = length
        positionVariable = "l"
    }
    const step = max / divisions

    useEffect(() => {
        if (beamType === "cantilever" && beamType === "general")
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
                    Load Location ({positionVariable}) &isin; [{min}, {max}], &Delta;={step}:
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