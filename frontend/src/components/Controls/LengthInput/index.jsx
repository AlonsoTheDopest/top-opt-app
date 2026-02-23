import {useEffect} from "react"

export default function LengthInput({
    length,
    setLength,
    beamType
})
{
    const min = 0;
    const max = 60;
    const step = 2;

    useEffect(() => {
        setLength(60.0)
    }, [beamType]);
    
    return (
        <>
            <label htmlFor="length" className="form-label large-control-label">
                Length &isin; [{min}, {max}], &Delta;={step}:
            </label>
            <input
                className="form-control large-control-input"
                type="number"
                name="length"
                min={min} max={max}
                step={step}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
            />
        </>
    )
}