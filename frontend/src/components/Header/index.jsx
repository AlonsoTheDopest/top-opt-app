import { useState } from 'react';
import "./style.css"
import UserGuidePdf from "../../images/User_Guide-Topology_Optimization.pdf";

export default function Header() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempTheme, setTempTheme] = useState('slightly-light');
    
    // State to handle the mobile hamburger menu
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const applyTheme = () => {
        document.documentElement.setAttribute('data-theme', tempTheme);
        setIsModalOpen(false);
    };

    return (
        <header className="main-header">
            
            
            <h1 className="headerH1">
                UQLID Lab Topology Optimization Software
            </h1>

            {/* Hamburger Icon (Only visible on smaller screens) */}
            <div className="hamburger-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                ☰
            </div>

            {/* Navigation Links - Spaced evenly, collapses on mobile */}
            <nav className={`header-nav-links ${isMenuOpen ? 'open' : ''}`}>
                <span 
                    onClick={() => {
                        setIsModalOpen(true);
                        setIsMenuOpen(false); 
                    }}
                    className="nav-item"
                >
                    🎨 Theme
                </span>

                <a 
                    href={UserGuidePdf}
                    target={"_blank"}
                    rel={"noreferrer"}
                    className="nav-item"
                >
                    The Concept
                </a>

                <a 
                    href="https://youtu.be/70D8uwAAuvo" 
                    target={"_blank"}
                    rel={"noreferrer"}
                    className="nav-item"
                >
                    📺 Video Tutorial
                </a>
            </nav>

            {/* --- THEME SELECTOR MODAL --- */}
            {isModalOpen && (
                <div className="theme-modal-overlay">
                    <div className="theme-modal-content">
                        <button className="close-btn" onClick={() => setIsModalOpen(false)}>✖</button>
                        <h2>Select Color Scheme</h2>
                        
                        <div className="theme-options">
                            <label>
                                <input type="radio" value="light" checked={tempTheme === 'light'} onChange={(e) => setTempTheme(e.target.value)} />
                                Light Mode
                            </label>
                            <label>
                                <input type="radio" value="slightly-light" checked={tempTheme === 'slightly-light'} onChange={(e) => setTempTheme(e.target.value)} />
                                Slightly Light (Current)
                            </label>
                            <label>
                                <input type="radio" value="slightly-dark" checked={tempTheme === 'slightly-dark'} onChange={(e) => setTempTheme(e.target.value)} />
                                Slightly Dark
                            </label>
                            <label>
                                <input type="radio" value="dark" checked={tempTheme === 'dark'} onChange={(e) => setTempTheme(e.target.value)} />
                                Dark Mode
                            </label>
                        </div>

                        <button className="save-theme-btn" onClick={applyTheme}>Save Theme</button>
                    </div>
                </div>
            )}
        </header>
    )
}