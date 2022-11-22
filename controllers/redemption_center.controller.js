const express = require('express');
const {generateClientCredentials} = require("../services/client_credentials/client_credential.service");
const {ADMIN_ROLE, STUDENT_ROLE} = require("../common/constants");
const {checkRequiredPermissions} = require("../services/auth/authenticator.service");
const redemptionCenterRouter = express.Router();

module.exports = (app) => {
    redemptionCenterRouter.get('/test', app.oauth.authorise(), checkRequiredPermissions([STUDENT_ROLE]), (req, res) => {
        res.send(generateClientCredentials());
    })
    return redemptionCenterRouter;
}
