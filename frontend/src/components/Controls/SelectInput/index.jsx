export default function SelectInput({
    htmlFor,
    labelName,
    value,
    handleChange,
    items
})
{
    return (
        <>
            <label 
                htmlFor={htmlFor}
                className="form-label large-control-label"
            >
                <p className='controlText'>{labelName}:</p>
            </label>
            
            <select 
                name={htmlFor}
                className="form-select beam-type-select large-control-input"
                value={value} 
                onChange={e => handleChange(e.target.value)} 
            >
                {items.map(item => (
                    <option value={item.value}>{item.name}</option>
                ))}
            </select>
        </>
    )
}