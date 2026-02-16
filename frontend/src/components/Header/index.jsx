import "./style.css"
import UserGuidePdf from "../../images/User_Guide-Topology_Optimization.pdf";

export default function Header() {
    return (
       
        <header className="main-header">
            
           
            <h1 className="headerH1">
                UQLID Lab Topology Optimization Software
            </h1>

            
            <div className="Guide_Section">
                <a 
                    href={UserGuidePdf}
                    target={"_blank"}
                    rel={"noreferrer"}
                    style={{ 
                        cursor: 'pointer', 
                        textDecoration: 'underline', 
                        color: 'rgb(255 255 204)'
                    }}
                >
                    The Concept
                </a>
            </div>
            
        </header>
    )
}
