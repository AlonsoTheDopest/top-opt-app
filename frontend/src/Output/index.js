import "./index.css"
import Image from 'react-bootstrap/Image'
import React from 'react';
import NewPlaceholder from "../images/black.gif";

// 1. IMPORT YOUR NEW IMAGES HERE
// Make sure the file names match exactly what you have in your folder
import CantileverPic from "../images/cantilever-beam.jpg";
import HalfMmbPic from "../images/half-mbb-beam.jpg";

export default function Output({ forceLoadValue, setForceLoadValue, beamType, simulationImage }) {
    
    const handleRangeChange = (e) => {
        let val = parseFloat(e.target.value);
        if (val === 0) val = 0.1; 
        setForceLoadValue(val);
    };

    return (
        <div className="output-wrapper">
            
            {/* Top Result Section (The one that shows the Julia result) */}
            <div className="imageBodyHolder banner-display">
                <Image 
                    src={simulationImage ? simulationImage : NewPlaceholder} 
                    fluid 
                />
            </div>

            {/* --- HALF MMB SECTION --- */}
            {beamType === 'half-mmb' && (
                <div className="imageBodyHolder main-beam-display">
                    <div className="force-load-top-middle">
                        <label className="form-label">
                            <p>Force: <strong>{forceLoadValue}</strong></p>
                        </label>
                        <input
                            type="range"
                            className="form-range force-load-slider horizontal"
                            min="-1"
                            max="1"
                            step="0.1"
                            value={forceLoadValue}
                            onChange={handleRangeChange}
                        />
                    </div>
                    
                    {/* 2. SWITCHED TO THE SPECIFIC HALF-MMB JPG */}
                    <Image src={HalfMmbPic} fluid />
                    
                </div>
            )}
            
            {/* --- CANTILEVER SECTION --- */}
            {beamType === 'cantilever' && (
                <div className="cantilever-wrapper">
                    
                    <div className="imageBodyHolder main-beam-display">
                        {/* 3. SWITCHED TO THE SPECIFIC CANTILEVER JPG */}
                        <Image src={CantileverPic} fluid />
                    </div>

                    <div className="force-load-right-side">
                        <label className="form-label">
                            <p>Force: <strong>{forceLoadValue}</strong></p>
                        </label>
                        <input
                            type="range"
                            className="form-range force-load-slider vertical-rotated"
                            min="-1"
                            max="1"
                            step="0.1"
                            value={forceLoadValue}
                            onChange={handleRangeChange}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}