const express = require('express');
const cors = require('cors');
const app = express();
require('./controllers/storefront')(app);

app.use(express.json());
app.use(cors({"origin": "*"}));
app.use(express.json());

const applicationPort = 3000;
app.listen(applicationPort, () => {
    console.log("Running Galileo-Champions backend in port  ", 3000);
})