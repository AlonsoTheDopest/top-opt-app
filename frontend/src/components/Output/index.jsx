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
                {/* {beamType === 'cantilever' ? (
                    <Image src={CantileverPic} fluid />
                ) : (
                    <Image src={HalfMbbPic} fluid />
                )} */}
                <Image src={beamPicture} fluid/>
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