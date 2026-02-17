export default function LoadInput({ load, setLoad })
{
    const min = -1
    const max = 1
    const step = 0.1
    const handleLoadChange = (e) => {
        let val = parseFloat(e.target.value);
        if (val === 0) val = 0.1; 
        setLoad(val);
    }

    return (
        <>
            <label htmlFor="load" className="form-label">
                <p className='controlText lastRun'>
                    Load &isin; [{min}, {max}], &Delta;={step}:
                </p>
                <strong>{load}</strong>
            </label>
            <input
                className="form-range"
                type="range"
                name="load"
                min={min} max={max} step={step}
                value={load}
                onChange={handleLoadChange}
            />
        </>
    )
}