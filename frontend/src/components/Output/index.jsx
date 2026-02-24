import React, { useState } from 'react'; 
import "./style.css"
import Image from 'react-bootstrap/Image'
import NewPlaceholder from "../../images/black.gif";

import CantileverPic from "../../images/cantilever-beam.jpg";
import HalfMbbPic from "../../images/half-mbb-beam.jpg";
import BeamTopLoadEdge from "../../images/beam-top-load-edge.png"
import BeamBottomLoadEdge from "../../images/beam-bottom-load-edge.png"
import BeamRightLoadEdge from "../../images/beam-right-load-edge.png"
import BeamLeftLoadEdge from "../../images/beam-left-load-edge.png"


export default function Output({beamType, simulationImage, loadEdge}) {
    // State to track the currently zoomed image
    const [zoomedImg, setZoomedImg] = useState(null);
  
    let beamPicture;
    switch (beamType)
    {
        case "cantilever":
            beamPicture = CantileverPic;
            break;

        case "half-mbb":
            beamPicture = HalfMbbPic;
            break;

        case "general":
            switch (loadEdge)
            {
                case "top":
                    beamPicture = BeamTopLoadEdge;
                    break;

                case "bottom":
                    beamPicture = BeamBottomLoadEdge;
                    break;

                case "right":
                    beamPicture = BeamRightLoadEdge;
                    break;

                case "left":
                    beamPicture = BeamLeftLoadEdge;
                    break;

                default:
                    break;
            }
            break;

        default:
            break;
    }
    
    return (
        <div className="output-wrapper">
            {/* --- TOP SECTION: SETUP IMAGES ONLY --- */}
            <div className="imageBodyHolder main-beam-display">
                <Image 
                    src={beamPicture} 
                    fluid
                    className="zoomable"
                    onClick={() => setZoomedImg(beamPicture)}
                />
            </div>

            
            <div className="imageBodyHolder banner-display">
                <Image 
                    src={simulationImage ? simulationImage : NewPlaceholder} 
                    fluid 
                    className="zoomable"
                    onClick={() => setZoomedImg(simulationImage ? simulationImage : NewPlaceholder)}
                />
            </div>

            {/* --- FULLSCREEN ZOOM OVERLAY --- */}
           
            <div 
                className={`zoom-overlay ${zoomedImg ? 'active' : ''}`} 
                onClick={() => setZoomedImg(null)}
            >
                <img src={zoomedImg} alt="Zoomed view" className="zoomed-image" />
            </div>

        </div>
    )
}