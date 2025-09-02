import "./index.css"
import { useState } from "react"
import axios from "axios"

export default function Controls() {

    const [ beamType, setBeamType ] = useState( "cantilever" )
    const [ load, setLoad ] = useState( 1.0 )
    const [ volumeFraction, setVolumeFraction ] = useState( 0.9 )
    const [ iterations, setIterations ] = useState( 5000 )

    const runTopOpt = ( event ) => {

        const topOptArgs = {
            beamType: beamType,
            load: load,
            volumeFraction: volumeFraction,
            iterations: iterations
        }

        axios.post( "http://localhost:8080/submit-top-opt-args", topOptArgs, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        event.preventDefault()
    }

    return ( 
        <>
            <h2>Controls</h2>
            
            <form>

                <label htmlFor="beam-type">Beam Type:</label>
                <select name="beam-type" value={ beamType } onChange={ ( event ) => setBeamType( event.target.value ) }>
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
                    value={ load }
                    onChange={ ( event ) => setLoad( event.target.value ) }
                />
                <p>{ load }</p>

                <label htmlFor="volume-fraction">Volume Fraction:</label>
                <input 
                    type="range" 
                    name="volume-fraction" 
                    min="0.1"
                    max="0.9"
                    step="0.1" 
                    value={ volumeFraction }
                    onChange={ ( event ) => setVolumeFraction( event.target.value ) }
                />
                <p>{ volumeFraction }</p>

                <label htmlFor="iterations">Iterations:</label>
                <input 
                    type="range" 
                    name="iterations" 
                    min="100"
                    max="5000"
                    step="100" 
                    value={ iterations }
                    onChange={ ( event ) => setIterations( event.target.value ) }
                />
                <p>{ iterations }</p>

                <input type="submit" value="Run Optimization" onClick={ runTopOpt }></input>

            </form>
        </>
    );
}
