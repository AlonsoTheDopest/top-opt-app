import {useState} from "react"

import SelectInput from "../SelectInput";

const SIDES = [
    {name: "Top Side", value: "TopSide"},
    {name: "Bottom Side", value: "BottomSide"},
    {name: "Right Side", value: "RightSide"},
    {name: "Left Side", value: "LeftSide"}
]

const CORNERS = [
    {name: "Bottom Left Corner", value: "BottomLeftCorner"},
    {name: "Bottom Right Corner", value: "BottomRightCorner"},
    {name: "Top Left Corner", value: "TopLeftCorner"},
    {name: "Top Right Corner", value: "TopRightCorner"}
]

const MAX_SIDES = 3;

let nextId = -1;

export default function BoundaryConditionInput({
    boundaryConditions, 
    setBoundaryConditions
})
{
    const [boundary, setBoundary] = useState("TopSide")
    const [dofFlags, setDofFlags] = useState([true, true])
    

    const handleDofFlagChange = (flags) => {
        !flags[0] && !flags[1] ? setDofFlags([true, true]) : setDofFlags(flags)
    }

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
                if (boundary.includes("Side") && sides >= MAX_SIDES)
                {
                    tooManySides = true;
                }
            }

            idx++
        }
        
        if (exists)
        {
            alert("Boundary exists.")
        }

        else if (conflicts)
        {
            alert("Boundary conflicts with existing boundary.")
        }

        else if (tooManySides)
        {
            alert(`Too many boundary conditions with sides (max=${MAX_SIDES}).`)
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

    return (
        <>
            <label>
                <p>Boundary Condition(s):</p>
            </label>

            <label>Fix x</label>
            <input 
                type="checkbox"
                checked={dofFlags[0]}
                onChange={e => handleDofFlagChange([e.target.checked, dofFlags[1]])}
            ></input>

            <label>Fix y</label>
            <input 
                type="checkbox"
                checked={dofFlags[1]}
                onChange={e => handleDofFlagChange([dofFlags[0], e.target.checked])}
            ></input>

            <SelectInput
                htmlFor={"boundary"}
                labelName={"Boundary"}
                value={boundary}
                handleChange={setBoundary}
                items={[...SIDES, ...CORNERS]}
            />

            <button type="button" onClick={handleClick}>Add</button>
            {boundaryConditions.map(bc => (
                <>
                    <p key={bc.id}>
                        {bc.boundary} (Fix x: {bc.dofFlags[0] ? "true" : "false"}, Fix y: {bc.dofFlags[1] ? "true" : "false"})
                    </p>
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