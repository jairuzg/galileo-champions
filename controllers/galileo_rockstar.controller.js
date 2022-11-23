const express = require('express');
const {checkRequiredPermissions} = require("../services/auth/authenticator.service");
const {ADMIN_ROLE, HTTP_STATUS} = require("../common/constants");
const rockstarService = require("../services/galileo_rockstar/galileo_rockstar.service");
const reqUtils = require("./request_utils.controller");
const rockstarRouter = express.Router();

module.exports = (app) => {
    rockstarRouter.get('/galileo-rockstar/nominated-emails',
        app.oauth.authorise(), checkRequiredPermissions([ADMIN_ROLE]), (req, res) => {
            rockstarService.fetchStudentsEmailsArray().then(emailsResp => {
                if (!emailsResp.error)
                    reqUtils.respond(res, {
                        message: "Student emails fetched from the database",
                        code: HTTP_STATUS.OK,
                        data: emailsResp.emails
                    });
                else reqUtils.respond(res, null, emailsResp.error);
            })
        }
    );

    return rockstarRouter;
};