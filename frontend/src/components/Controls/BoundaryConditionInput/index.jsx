import {useState, useEffect} from "react"

const SIDES = [
    "TopSide",
    "BottomSide",
    "RightSide",
    "LeftSide"
]
const CORNERS = [
    "BottomLeftCorner",
    "BottomRightCorner",
    "TopRightCorner",
    "TopLeftCorner"
]

export default function BoundaryConditionInput({
    boundaryConditions, 
    setBoundaryConditions
})
{
    const [boundary, setBoundary] = useState("TopSide")
    const [dofFlags, setDofFlags] = useState([true, true])
    

    const handleClick = () => {
        setBoundaryConditions([
            ...boundaryConditions,
            {
                boundary,
                dofFlags
            }
        ])
    }

    useEffect(() => {
        if (!dofFlags[0] && !dofFlags[1])
        {
            setDofFlags([true, true])
        }
    }, [dofFlags])

    return (
        <>
            <label>
                <p>Boundary Condition(s):</p>
            </label>
            <label>Fix x</label>
            <input 
                type="checkbox"
                checked={dofFlags[0]}
                onChange={e => setDofFlags([e.target.checked, dofFlags[1]])}
                
            ></input>

            <label>Fix y</label>
            <input 
                type="checkbox"
                checked={dofFlags[1]}
                onChange={e => setDofFlags([dofFlags[0], e.target.checked])}
            ></input>
            <select 
                value={boundary}
                onChange={e => setBoundary(e.target.value)}
                
            >
                {SIDES.map(item => (
                    <option value={item}>{item}</option>
                ))}
                {CORNERS.map(item => (
                    <option value={item}>{item}</option>
                ))}
            </select>
            <button type="button" onClick={handleClick}>Add</button>
            {boundaryConditions.map(bc => (
                <p>{bc.boundary}</p>
            ))}
        </>
    )
}