export default function IterationsInput({ iterations, setIterations })
{
    return (
        <>
            <label htmlFor="iterations" className="form-label large-control-label">Iterations:</label>
            <input
                className="form-control large-control-input"
                type="number"
                name="iterations"
                min="0" max="2000"
                step="100"
                value={iterations}
                onChange={(e) => setIterations( Number( e.target.value ) )}
            />
        </>
    )
}