export default function IterationsInput({ iterations, setIterations })
{
    const step = 50
    const min = step
    const max = 500
    return (
        <>
            <label htmlFor="iterations" className="form-label large-control-label">
                Iterations &isin; [{min}, {max}], &Delta;={step}:
            </label>
            <input
                className="form-control large-control-input"
                type="number"
                name="iterations"
                min={min} max={max}
                step={step}
                value={iterations}
                onChange={(e) => setIterations( Number( e.target.value ) )}
            />
        </>
    )
}