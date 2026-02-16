import './App.css'
import Header from "./components/Header/Header"
import Controls from "./components/Controls/Controls"
import Output from "./components/Output/Output"
import {BrowserRouter, Routes, Route} from "react-router-dom"
import { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap';

function MainMenu()
{
  const [forceLoadValue, setForceLoadValue] = useState(0);
  const [beamType, setBeamType] = useState('cantilever');

  // 1. NEW STATE: Holds the result image from the server
  const [simulationImage, setSimulationImage] = useState(null);
  return (
    <Container fluid>
      <Header />
      <Row>
        <Col>
          <Output 
            forceLoadValue={forceLoadValue} 
            setForceLoadValue={setForceLoadValue} 
            beamType={beamType}
            // 2. PASS THE IMAGE DATA TO OUTPUT
            simulationImage={simulationImage}
          /> 
        </Col>
        <Col>
          <Controls 
            beamType={beamType} 
            setBeamType={setBeamType} 
            // 3. PASS THE SETTER TO CONTROLS
            setSimulationImage={setSimulationImage}
          />
        </Col>
      </Row>
    </Container>
  )
}

function Results()
{
  const [results, setResults] = useState([])
  const getResults = async () => {
    const res = await fetch("/results", {method: "GET"})
    const data = await res.json()
    setResults(data)
  }

  useEffect(() => {
    getResults();
  }, [])

  return (
    <>
      <h1>Optimization Results</h1>
      {results.map((result) => (
        <>
          <p>Beam Type: {result.beam_type}</p>
          <p>Load: {result.load}</p>
          <p>Load Location: {result.load_location}</p>
          <p>Volume Fraction: {result.volume_fraction}</p>
          <p>Iterations: {result.iterations}</p>
          <img 
            src={result.image} 
            alt={"Optimized beam"}
            style={{maxWidth: "400px"}}
          />
        </>
      ))}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenu/>}/>
        <Route path="/results" element={<Results/>}/>
      </Routes>
    </BrowserRouter>
  );
}


export default App;
