export default function LoadInput({ load, setLoad })
{
    const minLoad = -1
    const maxLoad = 1
    const handleLoadChange = (e) => {
        let val = parseFloat(e.target.value);
        if (val === 0) val = 0.1; 
        setLoad(val);
    }

    return (
        <>
            <label htmlFor="load" className="form-label"><p className='controlText lastRun'>Load &isin; [{minLoad}, {maxLoad}]:</p><strong>{load}</strong></label>
            <input
                className="form-range"
                type="range"
                name="load"
                min={minLoad} max={maxLoad} step="0.1"
                value={load}
                onChange={handleLoadChange}
            />
        </>
    )
}