export default function LoadEdgeInput({loadEdge, setLoadEdge})
{
    const EDGES = [
        {edge: "Top", value: "top"},
        {edge: "Bottom", value: "bottom"},
        {edge: "Right", value: "right"},
        {edge: "Left", value: "left"},
    ]

    return (
        <>
            <label 
                htmlFor="load-edge" 
                className="form-label"
            >
                <p className='controlText'>Load Edge:</p>
            </label>

            <select
                name="load-edge" 
                className="form-select laod-edge-select large-control-input"
                value={loadEdge} 
                onChange={e => setLoadEdge(e.target.value)} 
            >
                {EDGES.map(item => (
                    <option value={item.value}>{item.edge}</option>
                ))}
            </select>
        </>
    )
}