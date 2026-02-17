export default function VolumeFractionInput({ 
    volumeFraction, 
    setVolumeFraction
})
{
    const min = 0.1
    const max = 0.9
    const step = 0.1
    return (
        <>
            <label htmlFor="volume-fraction" className="form-label">
                <p className='lastRun'>
                    Volume Fraction &isin; [{min}, {max}], &Delta;={step}:
                </p>
                <strong>{volumeFraction}</strong>
            </label>
            <input
                className="form-range"
                type="range"
                name="volume-fraction"
                min={min} max={max} step={step}
                value={volumeFraction}
                onChange={(e) => setVolumeFraction( Number( e.target.value ) ) }
            />
        </>
    )
}