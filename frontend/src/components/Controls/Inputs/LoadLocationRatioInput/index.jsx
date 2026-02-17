import {useEffect} from "react"

export default function LoadLocationRatioInput({
    loadLocationRatio,
    setLoadLocationRatio,
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
            setLoadLocationRatio(height / 2.0);
        } 
        else if( beamType === "half-mbb")
        {
            setLoadLocationRatio(length / 2.0);
        }
    }, [beamType, length, height, setLoadLocationRatio]);

    return (
        <>
            <label htmlFor="load-location" className="form-label"><p className='controlText lastRun'>Load Location Ratio &isin; [{minLoadLocation}, {maxLoadLocation}]:</p><strong>{loadLocationRatio}</strong></label>
            <input
                className="form-range"
                type="range"
                name="load"
                min={minLoadLocation} max={maxLoadLocation} step={loadLocationStep}
                value={loadLocationRatio}
                onChange={(e)=>setLoadLocationRatio(e.target.value)}
            />
        </>
    )
}