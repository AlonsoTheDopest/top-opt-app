import "./index.css"

export default function Controls() {
    return ( 
        <>
            <h2>Controls</h2>
            <div id="controlBody">
                <form action="" method="post">
                    <div className="controlOptions">
                        <div className="options">
                            <label htmlFor="beam-type" >Beam Type:</label>
                            <select name="beam-type" className="beam-type-select">
                                <option value="cantilever">Cantilever</option>
                                <option value="half-mmb">Half MMB</option>
                            </select>       
                        </div>
                        <div className="options">
                            <label htmlFor="load">Load:</label>
                                <input 
                                    type="input" 
                                    name="load"
                                    min="-1.0"
                                    max="1.0"
                                    step="0.1" 
                                />    
                        </div>
                        <div className="options">
                            <label htmlFor="volume-fraction">Volume Fraction:</label>
                                <input 
                                    type="input" 
                                    name="volume-fraction" 
                                    min="-1.0"
                                    max="1.0"
                                    step="0.1" 
                                />   
                        </div>
                        <div className="options">
                            <label htmlFor="iterations">Iterations:</label>
                                <input 
                                    type="input" 
                                    name="iterations" 
                                    min="100"
                                    max="5000"
                                    step="100" />    
                        </div>
                    </div>
                    

                    

                    

                    
                    <input type="submit" value="Run Optimization"></input>

                </form>    
            </div>
            
        </>
    );
}
