export default function IterationsInput({ iterations, setIterations })
{
    const iterationsStep = 50
    const minIterations = iterationsStep
    const maxIterations = 500
    return (
        <>
            <label htmlFor="iterations" className="form-label large-control-label">Iterations &isin; [{minIterations}, {maxIterations}]:</label>
            <input
                className="form-control large-control-input"
                type="number"
                name="iterations"
                min={minIterations} max={maxIterations}
                step={iterationsStep}
                value={iterations}
                onChange={(e) => setIterations( Number( e.target.value ) )}
            />
        </>
    )
}