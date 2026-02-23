import {useEffect} from "react"

export default function HeightInput({
    height,
    setHeight,
    beamType
})
{
    const min = 1;
    const max = 60;
    const step = 1;

    useEffect(() => {
        setHeight(20.0)
    }, [beamType]);

    return (
        <>
            <label htmlFor="height" className="form-label large-control-label">
                Height &isin; [{min}, {max}], &Delta;={step}:
            </label>
            <input
                className="form-control large-control-input"
                type="number"
                name="height"
                min={min} max={max}
                step={step}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
            />
        </>
    )
}