import {useState, useRef, useEffect} from 'react';
import "./style.css"
import SubmitButton from "./SubmitButton"
import { Container, Row, Col } from 'react-bootstrap';
import BoundaryConditionInput from './BoundaryConditionInput';
import LoadLocationInput from './LoadLocationInput';
import NumberInput from './NumberInput';
import RangeInput from './RangeInput';
import SelectInput from './SelectInput';

const BEAMS = [
    {name: "Cantilever", value: "cantilever"},
    {name: "Half MBB", value: "half-mbb"},
    {name: "General", value: "general"},
]

const EDGES = [
        {name: "Top", value: "top"},
        {name: "Bottom", value: "bottom"},
        {name: "Right", value: "right"},
        {name: "Left", value: "left"},
    ]

// 1. ADD setSimulationImage TO PROPS
export default function Controls({
    beamType, 
    setBeamType, 
    setSimulationImage,
    loadEdge,
    setLoadEdge
})
{
    const [volumeFraction, setVolumeFraction] = useState(0.3);
    const [iterations, setIterations] = useState(50);
    const [load, setLoad] = useState(-1.0); 
    const [length, setLength] = useState(60.0)
    const [height, setHeight] = useState(20.0)
    const [loadLocation, setLoadLocation] = useState(height / 2.0);
    const [boundaryConditions, setBoundaryConditions] = useState([]);
    const [loadAngle, setLoadAngle] = useState(0.0);

    const [isLoading, setIsLoading] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [lastRunTime, setLastRunTime] = useState(null);
    const intervalRef = useRef(null);
    const startTimeRef = useRef(null);

    useEffect(() => {
        if (beamType === "cantilever" )
        {
            setLoadEdge("right")
        }

        else if (beamType === "half-mbb")
        {
            setLoadEdge("top")
        }

        else if (beamType === "general")
        {
            setLoadEdge("top")
        }
    }, [beamType, setLoadEdge])

    const handleSubmit = async (e) => {
        e.preventDefault();

        let i = 0;
        const arrLen = boundaryConditions.length;
        let conflicts = false;
        let bc;

        while(i < arrLen && !conflicts)
        {
            bc = boundaryConditions[i];
            if ((bc.boundary.includes("Top") && loadEdge === "top") ||
                (bc.boundary.includes("Bottom") && loadEdge === "bottom") ||
                (bc.boundary.includes("Left") && loadEdge === "left") ||
                (bc.boundary.includes("Right") && loadEdge === "right"))
            {
                conflicts = true;
            }
            i++
        }

        if (conflicts)
        {
            alert("Load edge conflicts with boundary conditions. Select a different load edge")
        }

        else
        {
            setIsLoading(true);
            setLastRunTime(null);
            setElapsedTime(0);
            // 2. CLEAR OLD IMAGE WHEN STARTING NEW RUN
            setSimulationImage(null);

            startTimeRef.current = Date.now();

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            intervalRef.current = setInterval(() => {
                const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setElapsedTime(seconds);
            }, 1000);

        
            const topOptArgs = { 
                beamType, 
                volumeFraction, 
                iterations, 
                loadEdge,
                load, 
                loadLocation, 
                length, 
                height,
                boundaryConditions,
                loadAngle
            };

            try {
                const res = await fetch("/run-top-opt", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(topOptArgs)
                });

                const data = await res.json();

                if (data.image) {
                    setSimulationImage(data.image);
                }

            } catch (error) {
                alert(`Optimization error:${error}`)
            } finally {
                setIsLoading(false);
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                
                const finalSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setLastRunTime(finalSeconds);
                setElapsedTime(0);
            }
        }
    };

    return (
        <>
            <footer className="d-flex">
                <form onSubmit={handleSubmit} className="d-flex flex-grow-1">
                    <Container className="d-flex flex-column justify-content-evenly flex-grow-1 text-center py-4 fs-3">
                        <Row className="justify-content-center large-control-container">
                            <Col md={8} lg={6}>
                                <SelectInput
                                    htmlFor={"beam-type"}
                                    labelName={"Beam Type"}
                                    value={beamType}
                                    handleChange={setBeamType}
                                    items={BEAMS}
                                />
                            </Col>
                        </Row>
                        {beamType === "general" ? (
                            <>
                                <Row className="justify-content-center large-control-container">
                                    <Col md={8} lg={6}>
                                        <NumberInput
                                            htmlFor={"length"}
                                            labelName={"Length (L)"}
                                            value={length}
                                            setValue={setLength}
                                            min={1}
                                            max={60}
                                            step={1}
                                        />
                                    </Col>
                                </Row>
                                <Row className="justify-content-center large-control-container">
                                    <Col md={8} lg={6}>
                                        <NumberInput
                                            htmlFor={"height"}
                                            labelName={"Height (H)"}
                                            value={height}
                                            setValue={setHeight}
                                            min={1}
                                            max={60}
                                            step={1}
                                        />
                                    </Col>
                                </Row>
                                <Row className="justify-content-center large-control-container">
                                    <Col md={8} lg={6}>
                                        <BoundaryConditionInput
                                            boundaryConditions={boundaryConditions}
                                            setBoundaryConditions={setBoundaryConditions}
                                        />
                                    </Col>
                                </Row>
                                <Row className="justify-content-center large-control-container">
                                    <Col md={8} lg={6}>
                                        <SelectInput
                                            htmlFor={"load-edge"}
                                            labelName={"Load Edge"}
                                            value={loadEdge}
                                            handleChange={setLoadEdge}
                                            items={EDGES}
                                        />
                                    </Col>
                                </Row>
                                <Row className="justify-content-center large-control-container">
                                    <Col md={8} lg={6}>
                                        <NumberInput
                                            htmlFor={"load-angle"}
                                            labelName={"Load Angle"}
                                            value={loadAngle}
                                            setValue={setLoadAngle}
                                            min={0}
                                            max={359}
                                            step={1}
                                        />
                                    </Col>
                                </Row>
                            </>
                        ) : (<></>)}
                        <Row className="justify-content-center ">
                            <Col md={8} lg={6}>
                                <RangeInput
                                    htmlFor={"load"}
                                    labelName={"Load"}
                                    value={load}
                                    min={-1}
                                    max={1}
                                    step={0.1}
                                    handleChange={newValue => {
                                        if (newValue === 0)
                                        {
                                            newValue = load > 0 ? 0.1 : -0.1
                                        }
                                        setLoad(newValue)
                                    }}
                                />
                            </Col>
                        </Row>
                        
                        <Row className="justify-content-center ">
                            <Col md={8} lg={6}>
                                <LoadLocationInput 
                                    loadLocation = {loadLocation}
                                    setLoadLocation = {setLoadLocation}
                                    length={length}
                                    height={height}
                                    loadEdge={loadEdge}
                                />
                            </Col>
                        </Row>

                        <Row className="justify-content-center ">
                            <Col md={8} lg={6}>
                                <RangeInput
                                    htmlFor={"volume-fraction"}
                                    labelName={"Volume Fraction"}
                                    value={volumeFraction}
                                    min={0.1}
                                    max={0.9}
                                    step={0.1}
                                    handleChange={setVolumeFraction}
                                />
                            </Col>
                        </Row>
                        
                        <Row className="justify-content-center large-control-container">
                            <Col md={8} lg={6}>
                                <NumberInput
                                    htmlFor={"iterations"}
                                    labelName={"Iterations"}
                                    value={iterations}
                                    setValue={setIterations}
                                    min={50}
                                    max={500}
                                    step={50}
                                />
                            </Col>
                        </Row>

                        <Row className="justify-content-center">
                            <Col>
                                <SubmitButton
                                    isLoading={isLoading}
                                    elapsedTime={elapsedTime}
                                    lastRunTime={lastRunTime}
                                />
                            </Col>
                        </Row>
                    </Container>
                </form>
            </footer>
        </>
    );
}
