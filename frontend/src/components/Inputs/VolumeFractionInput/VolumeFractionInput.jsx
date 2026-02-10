export default function VolumeFractionInput({ 
    volumeFraction, 
    setVolumeFraction
})
{
    return (
        <>
            <label htmlFor="volume-fraction" className="form-label"><p className='lastRun'>Volume Fraction(0.1 to 0.9 with Iterations of 0.1):</p><br></br> <strong>{volumeFraction}</strong></label>
            <input
                className="form-range"
                type="range"
                name="volume-fraction"
                min="0.1" max="0.9" step="0.1"
                value={volumeFraction}
                onChange={(e) => setVolumeFraction( Number( e.target.value ) ) }
            />
        </>
    )
}