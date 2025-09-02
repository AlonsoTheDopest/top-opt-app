import "./index.css"

export default function Controls() {
    return ( 
        <>
            <h2>Controls</h2>
            <form action="" method="post">
                <label htmlFor="beam-type">Beam Type:</label>
                <select name="beam-type">
                    <option value="cantilever">Cantilever</option>
                    <option value="half-mmb">Half MMB</option>
                </select>
                <label htmlFor="load">Load:</label>
                <input 
                    type="range" 
                    name="load"
                    min="-1.0"
                    max="1.0"
                    step="0.1" 
                />
                <label htmlFor="volume-fraction">Volume Fraction:</label>
                <input 
                    type="range" 
                    name="volume-fraction" 
                    min="-1.0"
                    max="1.0"
                    step="0.1" 
                />
                <label htmlFor="iterations">Iterations:</label>
                <input 
                    type="range" 
                    name="iterations" 
                    min="100"
                    max="5000"
                    step="100" />
                <input type="submit" value="Run Optimization"></input>
            </form>
        </>
    );
}
