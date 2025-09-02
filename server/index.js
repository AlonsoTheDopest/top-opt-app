const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }));

// You might also need JSON parsing if your forms submit JSON data
app.use(bodyParser.json());

app.post( "/submit-top-opt-args", ( req, res ) => {

    const beamType = req.body.beamType
    const load = req.body.load
    const volumeFraction = req.body.volumeFraction
    const iterations = req.body.iterations

    console.log( `Beam Type: ${ beamType }` )
    console.log( `Load: ${ load }` )
    console.log( `Volume Fraction: ${ volumeFraction }` )
    console.log( `Iterations: ${ iterations }` )

})

app.listen( 8080, () => {
      console.log( "server listening on port 8080" )
})