const express = require('express');
const cors = require('cors');
const app = express();
const oAuthService = require("./services/auth/token_service");
const oAuth2Server = require("node-oauth2-server");
const {errorHandler} = require("./common/utils");
app.oauth = oAuth2Server({
    model: oAuthService,
    grants: ["password"],
    debug: true
});
app.use(express.json());
app.use(cors({"origin": "*"}));
app.use(express.urlencoded({extended: true}));


const userRouter = require("./controllers/user.controller")(app);
const authRouter = require("./controllers/auth.controller")(app);
const rcRouter = require('./controllers/redemption_center.controller')(app);
const ccRouter = require('./controllers/client_credential.controller')(app);
const cpRouter = require('./controllers/champion_points.controller')(app);

app.use('/api', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/redemptionCenter', rcRouter);
app.use('/api', ccRouter);
app.use('/api', cpRouter);
app.use(errorHandler());


const applicationPort = 3414;
app.listen(applicationPort, () => {
    console.log("Running Galileo-Champions backend in port  ", applicationPort);
})