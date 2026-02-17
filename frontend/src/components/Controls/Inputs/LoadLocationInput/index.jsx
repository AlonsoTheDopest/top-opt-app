import {useEffect} from "react"

export default function LoadLocationInput({
    loadLocation,
    setLoadLocation,
    beamType,
    length,
    height
})
{
    let minLoadLocation;
    let maxLoadLocation;
    const divisions = 10.0

    if (beamType === "cantilever") {
        minLoadLocation = 0
        maxLoadLocation = height
    } else {
        minLoadLocation = length / divisions
        maxLoadLocation = length
    }
    const loadLocationStep = maxLoadLocation / divisions

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
            <label htmlFor="load-location" className="form-label"><p className='controlText lastRun'>Load Location Ratio &isin; [{minLoadLocation}, {maxLoadLocation}]:</p><strong>{loadLocation}</strong></label>
            <input
                className="form-range"
                type="range"
                name="load"
                min={minLoadLocation} max={maxLoadLocation} step={loadLocationStep}
                value={loadLocation}
                onChange={(e)=>setLoadLocation(e.target.value)}
            />
        </>
    )
}