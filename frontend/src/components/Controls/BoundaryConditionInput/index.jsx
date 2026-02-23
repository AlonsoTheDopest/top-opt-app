import {useState} from "react"

const SUPPORT_TYPES = [
    "Fixed",
    "Pin",
    "Roller"
]
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
    // const [boundaryConditions, setBoundaryConditions] = useState([]);

    const [supportType, setSupportType] = useState("Fixed");
    const [boundary, setBoundary] = useState("TopSide")
    

    const handleClick = () => {
        let dof_flags;
        if (supportType == "Fixed" || supportType == "Pin")
        {
            dof_flags = [true, true]
        }

        else // Roller
        {
            if (boundary.includes("Corner"))
            {
                dof_flags = [false, true]
            }

            else // Side
            {
                if (boundary.includes("Top") && boundary.includes("Bottom"))
                {
                    dof_flags = [false, true]
                }

                else
                {
                    dof_flags = [true, false]
                }
            }
        }
        setBoundaryConditions([
            ...boundaryConditions,
            {
                boundary,
                dof_flags
            }
        ])
    }

    return (
        <>
            <label>
                <p>Boundary Condition(s):</p>
            </label>
            <select 
                value={supportType}
                onChange={e => setSupportType(e.target.value)}
            >
                {SUPPORT_TYPES.map(item =>(
                    <option value={item}>{item}</option>
                ))}
            </select>
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