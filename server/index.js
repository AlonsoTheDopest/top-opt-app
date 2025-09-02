const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const axios = require('axios')

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }));

// You might also need JSON parsing if your forms submit JSON data
app.use(bodyParser.json());

app.post( "/submit-top-opt-args", ( req, res ) => {

    const beamType = req.body.beamType
    const load = req.body.load
    const volumeFraction = req.body.volumeFraction
    const iterations = req.body.iterations

    console.log( beamType )
    console.log( load )
    console.log( volumeFraction )
    console.log( iterations )

    const topOptArgs = {
        beamType: beamType,
        load: load,
        volumeFraction: volumeFraction,
        iterations: iterations
    }

    axios.post('http://localhost:8081/run-top-opt', topOptArgs )

})

app.listen( 8080, () => {
      console.log( "server listening on port 8080" )
})