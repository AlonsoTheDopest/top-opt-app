export default function VolumeFractionInput({ 
    volumeFraction, 
    setVolumeFraction
})
{
    const minVolumeFraction = 0.1
    const maxVolumeFraction = 0.9
    return (
        <>
            <label htmlFor="volume-fraction" className="form-label"><p className='lastRun'>Volume Fraction &isin; [{minVolumeFraction}, {maxVolumeFraction}]:</p><strong>{volumeFraction}</strong></label>
            <input
                className="form-range"
                type="range"
                name="volume-fraction"
                min={minVolumeFraction} max={maxVolumeFraction} step="0.1"
                value={volumeFraction}
                onChange={(e) => setVolumeFraction( Number( e.target.value ) ) }
            />
        </>
    )
}