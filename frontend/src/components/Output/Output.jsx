import "./Output.css"
import Image from 'react-bootstrap/Image'
import NewPlaceholder from "../../images/black.gif";

import CantileverPic from "../../images/cantilever-beam.jpg";
import HalfMbbPic from "../../images/half-mbb-beam.jpg";

export default function Output({ forceLoadValue, setForceLoadValue, beamType, simulationImage }) {
    
    const handleRangeChange = (e) => {
        let val = parseFloat(e.target.value);
        if (val === 0) val = 0.0; 
        setForceLoadValue(val);
    };

    return (
        <div className="output-wrapper">
            {/* --- TOP SECTION: SETUP IMAGES ONLY --- */}
            <div className="imageBodyHolder main-beam-display">
                {beamType === 'cantilever' ? (
                    <Image src={CantileverPic} fluid />
                ) : (
                    <Image src={HalfMbbPic} fluid />
                )}
            </div>

            {/* --- BOTTOM SECTION: RESULT/LOADING + SLIDER --- */}
            <div className="imageBodyHolder banner-display">
                <Image 
                    src={simulationImage ? simulationImage : NewPlaceholder} 
                    fluid 
                />
            </div>

        </div>
    )
}