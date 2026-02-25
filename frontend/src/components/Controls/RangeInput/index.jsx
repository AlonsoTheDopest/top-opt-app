export default function RangeInput({
    htmlFor,
    labelName,
    value,
    min,
    max,
    step,
    handleChange
})
{
    return (
        <>
            <label htmlFor={htmlFor} className="form-label">
                <p className='lastRun'>
                    {labelName} &isin; [{min}, {max}], &Delta;={step}:
                </p>
                <strong>{value}</strong>
            </label>
            <input
                className="form-range"
                type="range"
                name={htmlFor}
                min={min} max={max} step={step}
                value={value}
                onChange={e => handleChange(Number(e.target.value))}
            />
        </>
    )
}