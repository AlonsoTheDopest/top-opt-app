export default function LoadInput({ load, setLoad })
{
    const handleLoadChange = (e) => {
        let val = parseFloat(e.target.value);
        if (val === 0) val = 0.1; 
        setLoad(val);
    }

    return (
        <>
            <label htmlFor="load" className="form-label"><p className='controlText'><p className='lastRun'>Load(-1 to 1 with Iterations of 0.1):</p> </p><strong>{load}</strong></label>
            <input
                className="form-range"
                type="range"
                name="load"
                min="-1" max="1" step="0.1"
                value={load}
                onChange={handleLoadChange}
            />
        </>
    )
}