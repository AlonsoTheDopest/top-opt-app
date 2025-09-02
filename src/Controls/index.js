import "./index.css"

export default function Controls() {
    return ( 
        <>
            <h2>Controls</h2>
            <form action="" method="post">
                <label htmlFor="load">Load:</label>
                <input type="range" name="load" />
                <label htmlFor="volume-fraction">Volume Fraction:</label>
                <input type="range" name="volume-fraction" />
                <label htmlFor="iterations">Iterations:</label>
                <input type="range" name="iterations" />
                <input type="submit" value="Run Optimization"></input>
            </form>
        </>
    );
}
