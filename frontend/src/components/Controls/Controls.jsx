import { useState, useRef } from 'react';
import "./Controls.css"
// import 'bootstrap/dist/css/bootstrap.min.css';
import BeamTypeInput from '../BeamTypeInput/BeamTypeInput'
import LoadInput from '../LoadInput/LoadInput'
import VolumeFractionInput from "../VolumeFractionInput/VolumeFractionInput"
import { Container, Row, Col, Button } from 'react-bootstrap';
import IterationsInput from '../IterationsInput/IterationInput';

// 1. ADD setSimulationImage TO PROPS
export default function Controls({ beamType, setBeamType, setSimulationImage }) {
    
    const [volumeFraction, setVolumeFraction] = useState(0.3);
    const [iterations, setIterations] = useState(500);
    const [load, setLoad] = useState(-1.0); 
    const length = 60.0
    const height = 20.0
    // const [ length, setLength ] = useState(60.0);
    // const [ height, setHeight ] = useState(20.0);
    const [ loadLocation, setLoadLocation ] = useState( 10.0 );

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

        const topOptArgs = { beamType, volumeFraction, iterations, load, loadLocation, length, height };

        try {
            const res = await fetch("/run-top-opt", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(topOptArgs)
            });

            // 3. PARSE THE RESPONSE FROM JULIA
            const data = await res.json();
            
            // 4. CHECK IF JULIA SENT AN IMAGE AND SAVE IT
            // Assumes your Julia JSON has a key called "image" with base64 data
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
                                    setLoadLocation = { setLoadLocation }
                                    length = { length }
                                    height = { height }
                                />
                            </Col>
                        </Row>
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
                                <Button 
                                    variant="success" 
                                    size="lg" 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="large-control-button"
                                >
                                    {isLoading ? `Optimizing... (${elapsedTime}s)` : "Run Optimization"}
                                </Button>
                                
                                <div className="timer-display" style={{ marginTop: '0.5vh'}}>
                                    {!isLoading && lastRunTime !== null && (
                                        <span className='lastRun'>Last run took: {lastRunTime}s</span>
                                    )}
                                </div>
                            </Col>
                        </Row>
                        
                    </Container>
                </form>
            </footer>
        </>
    );
}
