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

let nextId = -1;

export default function BoundaryConditionInput({
    boundaryConditions, 
    setBoundaryConditions
})
{
    const [boundary, setBoundary] = useState("TopSide")
    const [dofFlags, setDofFlags] = useState([true, true])
    

    const handleClick = () => {
        let exists = false;
        let conflicts = false;
        let tooManySides = false;
        let sides = 0;
        let idx = 0;
        const arrLen = boundaryConditions.length
        let bc

        while (idx < arrLen && !exists && !conflicts && !tooManySides)
        {
            bc = boundaryConditions[idx]

            if (bc.boundary === boundary)
            {
                exists = true;
            }

            else if ((bc.boundary.includes("Top") && boundary.includes("Top")) ||
                     (bc.boundary.includes("Bottom") && boundary.includes("Bottom")) ||
                     (bc.boundary.includes("Left") && boundary.includes("Left")) ||
                     (bc.boundary.includes("Right") && boundary.includes("Right")))
            {
                conflicts = true;
            }

            if (bc.boundary.includes("Side"))
            {
                sides++
                if (boundary.includes("Side") && sides >= 3)
                {
                    tooManySides = true;
                }
            }

            idx++
        }
        
        if (exists)
        {
            alert("Boundary condition exists.")
        }

        else if (conflicts)
        {
            alert("Boundary condition conflicts with existing boundary condition.")
        }

        else if (tooManySides)
        {
            alert("Too many boundary conditions with sides (max=3).")
        }

        else
        {
            setBoundaryConditions([
                ...boundaryConditions,
                {
                    id: ++nextId,
                    boundary,
                    dofFlags
                }
            ])
        }
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
                <>
                    <p key={bc.id}>{bc.boundary} (Fix x: {bc.dofFlags[0] ? "true" : "false"}, Fix y: {bc.dofFlags[1] ? "true" : "false"})</p>
                    <button 
                        type="button"
                        onClick={() => {
                            setBoundaryConditions(
                                boundaryConditions.filter(item => (
                                    item.id !== bc.id
                                ))
                            );
                        }}
                    >
                        Delete
                    </button>
                </>
            ))}
        </>
    )
}