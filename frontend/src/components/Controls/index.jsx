import { useState, useRef } from 'react';
import "./style.css"
import {
    BeamTypeInput,
    LoadInput,
    LoadLocationInput,
    VolumeFractionInput,
    IterationsInput
} from "./Inputs"
import SubmitButton from "./SubmitButton"
import { Container, Row, Col } from 'react-bootstrap';
import LengthInput from './LengthInput';
import HeightInput from './HeightInput';

// 1. ADD setSimulationImage TO PROPS
export default function Controls({
    beamType, 
    setBeamType, 
    setSimulationImage
})
{
    const [volumeFraction, setVolumeFraction] = useState(0.3);
    const [iterations, setIterations] = useState(50);
    const [load, setLoad] = useState(-1.0); 
    const [length, setLength] = useState(60.0)
    const [height, setHeight] = useState(20.0)
    const [loadLocation, setLoadLocation] = useState(height / 2.0);

    const [isLoading, setIsLoading] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [lastRunTime, setLastRunTime] = useState(null);
    const intervalRef = useRef(null);
    const startTimeRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

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
            load, 
            loadLocation, 
            length, 
            height
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
            console.error("Optimization error:", error);
        } finally {
            setIsLoading(false);
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            
            const finalSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setLastRunTime(finalSeconds);
            setElapsedTime(0);
        }
    };

    return (
        <>
            <footer className="d-flex">
                <form onSubmit={handleSubmit} className="d-flex flex-grow-1">
                    <Container className="d-flex flex-column justify-content-evenly flex-grow-1 text-center py-4 fs-3">
                        <Row className="justify-content-center large-control-container">
                            <Col md={8} lg={6}>
                                <BeamTypeInput
                                    beamType = { beamType }
                                    setBeamType = { setBeamType }
                                />
                            </Col>
                        </Row>
                        {beamType === "general" ? (
                            <>
                                <Row className="justify-content-center large-control-container">
                                    <Col md={8} lg={6}>
                                        <LengthInput
                                            length={length}
                                            setLength={setLength}
                                            beamType={beamType}
                                        />
                                    </Col>
                                </Row>
                                <Row className="justify-content-center large-control-container">
                                    <Col md={8} lg={6}>
                                        <HeightInput
                                            height={height}
                                            setHeight={setHeight}
                                            beamType={beamType}
                                        />
                                    </Col>
                                </Row>
                            </>
                        ) : (
                            <></>
                        )}
                        <Row className="justify-content-center ">
                            <Col md={8} lg={6}>
                                <LoadInput 
                                    load = { load }
                                    setLoad = { setLoad }
                                />
                            </Col>
                        </Row>
                        
                        <Row className="justify-content-center ">
                            <Col md={8} lg={6}>
                                <LoadLocationInput 
                                    loadLocation = { loadLocation }
                                    setLoadLocation = { setLoadLocation }
                                    beamType={beamType}
                                    length={length}
                                    height={height}
                                />
                            </Col>
                        </Row>

                        <Row className="justify-content-center ">
                            <Col md={8} lg={6}>
                                <VolumeFractionInput
                                    volumeFraction = { volumeFraction }
                                    setVolumeFraction = { setVolumeFraction }
                                />
                            </Col>
                        </Row>
                        
                        <Row className="justify-content-center large-control-container">
                            <Col md={8} lg={6}>
                                <IterationsInput
                                    iterations = { iterations }
                                    setIterations = { setIterations }
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
