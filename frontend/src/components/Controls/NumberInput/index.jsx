export default function NumberInput({
    htmlFor,
    labelName,
    value,
    setValue,
    min,
    max,
    step
})
{
    return (
        <>
            <label htmlFor={htmlFor} className="form-label">
                {labelName} &isin; [{min}, {max}], &Delta;={step}:
            </label>
            <input
                className="form-control"
                type="number"
                name={htmlFor}
                min={min} max={max} step={step}
                value={value}
                onChange={e => {setValue(Number(e.target.value))}}
            />
        </>
    );
}