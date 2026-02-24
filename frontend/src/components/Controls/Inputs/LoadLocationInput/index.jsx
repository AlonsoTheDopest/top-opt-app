import {useEffect} from "react"

export default function LoadLocationInput({
    loadLocation,
    setLoadLocation,
    length,
    height,
    loadEdge
})
{
    const min = 0
    let max
    let positionVariable
    const step = 1;

    if (loadEdge === "right" || loadEdge === "left")
    {
        max = height
        positionVariable = "y"
    } 
    
    else if (loadEdge === "top" || loadEdge === "bottom")
    {
        max = length
        positionVariable = "x"
    }

    useEffect(() => {
        if (loadEdge === "right" || loadEdge === "left")
        {
            setLoadLocation(height / 2.0);
        } 
        else if(loadEdge === "top" || loadEdge === "bottom")
        {
            setLoadLocation(length / 2.0);
        }
    }, [loadEdge, setLoadLocation, height, length]);

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