export default function LoadLocationRatioInput({
    loadLocationRatio,
    setLoadLocationRatio
})
{
    return (
        <>
            <label htmlFor="load-location" className="form-label"><p className='controlText'><p className='lastRun'>Load Location Ratio:</p> </p><strong>{loadLocationRatio}</strong></label>
            <input
                className="form-range"
                type="range"
                name="load"
                min="0.1" max="0.9" step="0.1"
                value={loadLocationRatio}
                onChange={(e)=>setLoadLocationRatio(e.target.value)}
            />
        </>
    )
}