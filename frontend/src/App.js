import './App.css'
import Header from "./Header"
import Controls from "./Controls"
import Output from "./Output"

import React, { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap';

function App() {
 
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
  );
}

export default App;