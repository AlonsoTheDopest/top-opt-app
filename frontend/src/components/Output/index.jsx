import React, { useState } from 'react'; 
import "./style.css"
import Image from 'react-bootstrap/Image'
import NewPlaceholder from "../../images/black.gif";

import CantileverPic from "../../images/cantilever-beam.jpg";
import HalfMbbPic from "../../images/half-mbb-beam.jpg";

export default function Output({beamType, simulationImage}) {
    // State to track the currently zoomed image
    const [zoomedImg, setZoomedImg] = useState(null);

    return (
        <div className="output-wrapper">
            {/* --- TOP SECTION: SETUP IMAGES ONLY --- */}
            <div className="imageBodyHolder main-beam-display">
                {beamType === 'cantilever' ? (
                    <Image 
                        src={CantileverPic} 
                        fluid 
                        className="zoomable"
                        onClick={() => setZoomedImg(CantileverPic)}
                    />
                ) : (
                    <Image 
                        src={HalfMbbPic} 
                        fluid 
                        className="zoomable"
                        onClick={() => setZoomedImg(HalfMbbPic)}
                    />
                )}
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