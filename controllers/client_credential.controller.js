const express = require('express');
const ccService = require("../services/client_credentials/client_credential.service");
const {ClientCredential} = require("../models/client_credential.model");
const {HTTP_STATUS, ADMIN_ROLE} = require("../common/constants");
const {checkRequiredPermissions} = require("../services/auth/authenticator.service");
const ccRouter = express.Router();

module.exports = (app) => {
    ccRouter.post('/client-credentials', app.oauth.authorise(), checkRequiredPermissions([ADMIN_ROLE]), (req, res) => {
        const clientCredentials = ccService.generateClientCredentials();
        ClientCredential.create({
            clientId: clientCredentials.clientId,
            clientSecret: clientCredentials.clientSecret,
            createdBy: req.user.email
        }).then(clientCredentialModel => {
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Client credentials were created successfully",
                data: clientCredentialModel.get({plain: true})
            })
        }).catch(ex => {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "There was an error while trying to create client credentials",
                error: ex.message
            });
        });
    });
    return ccRouter;
}
