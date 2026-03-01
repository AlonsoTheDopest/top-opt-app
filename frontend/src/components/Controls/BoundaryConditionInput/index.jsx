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
        <div className="d-flex flex-column h-100 justify-content-end">
            
            {/* 1. Removed the <p> tag and added the standard form-label class */}
            <label className="form-label mb-2 text-center">Boundary Condition(s):</label>

            {/* 2. Grouped the checkboxes using Flexbox so they sit nicely side-by-side */}
            <div className="d-flex justify-content-center align-items-center gap-3 mb-2">
                <div className="d-flex align-items-center gap-1">
                    <label className="form-label mb-0" htmlFor="fixX">Fix x</label>
                    <input 
                        type="checkbox"
                        id="fixX"
                        className="form-check-input mt-0"
                        checked={dofFlags[0]}
                        onChange={e => handleDofFlagChange([e.target.checked, dofFlags[1]])}
                    />
                </div>
                <div className="d-flex align-items-center gap-1">
                    <label className="form-label mb-0" htmlFor="fixY">Fix y</label>
                    <input 
                        type="checkbox"
                        id="fixY"
                        className="form-check-input mt-0"
                        checked={dofFlags[1]}
                        onChange={e => handleDofFlagChange([dofFlags[0], e.target.checked])}
                    />
                </div>
            </div>

            {/* 3. The dropdown for the Boundary */}
            <SelectInput
                htmlFor={"boundary"}
                labelName={"Location"}
                value={boundary}
                handleChange={setBoundary}
                items={[...SIDES, ...CORNERS]}
            />

            
            <button type="button" className="btn btn-secondary btn-sm mt-2" onClick={handleClick}>
                Add Condition
            </button>


            {boundaryConditions.length > 0 && (
                <div className="row mt-3 text-start g-2">
                    {boundaryConditions.map(bc => (
                        <div key={bc.id} className="col-12 col-sm-6 col-md-4">
                            <div className="d-flex justify-content-between align-items-center bg-light text-dark p-2 rounded h-100" style={{fontSize: "0.9rem", border: "1px solid #ccc"}}>
                                <span>{bc.boundary} <br/> (x:{bc.dofFlags[0] ? "T" : "F"}, y:{bc.dofFlags[1] ? "T" : "F"})</span>
                                <button 
                                    type="button"
                                    className="btn btn-danger d-flex justify-content-center align-items-center p-0 ms-2"
                                    style={{ width: "35px", height: "35px", fontSize: "0.75rem", flexShrink: 0 }}
                                    onClick={() => {
                                        setBoundaryConditions(
                                            boundaryConditions.filter(item => item.id !== bc.id)
                                        );
                                    }}
                                >
                                    X
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}