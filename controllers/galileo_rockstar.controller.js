const express = require('express');
const {checkRequiredPermissions} = require("../services/auth/authenticator.service");
const {ADMIN_ROLE, HTTP_STATUS} = require("../common/constants");
const rockstarService = require("../services/galileo_rockstar/galileo_rockstar.service");
const reqUtils = require("./request_utils.controller");
const {body} = require("express-validator");
const rockstarFormService = require("../services/rockstar/rockstar-form.service");
const rockstarPeriodService = require("../services/rockstar/rockstar_period.service");
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

    rockstarRouter.get('/current-rockstar-period', (req, res, next) => {
        rockstarPeriodService.getCurrentPeriod().then(periodResp => {
            if (!periodResp.error) reqUtils.respond(res, {
                code: HTTP_STATUS.OK,
                message: "We could retrieve the current period for the RoCkStAr voting",
                data: periodResp.currentPeriod
            }); else reqUtils.respond(res, null, periodResp.error);
        });
    });

    rockstarRouter.post('/rockstar-form',
        body('nominatedEmail').isEmail().withMessage("A valid email is required for the nominated rockstar"),
        body("voterEmail").isEmail().withMessage("The voter email is not valid or not in the right format"),
        body("reasonToNominate").isString().notEmpty().withMessage("The reason to nominate is required"),
        app.oauth.authorise(),
        (req, res, next) => {
            reqUtils.validateRequest(req);
            rockstarFormService.saveRockstarFormVote(req.body).then(saveVoteResp => {
                if (!saveVoteResp.error) reqUtils.respond(res, {
                    code: HTTP_STATUS.OK,
                    message: "Thanks for submitting your vote, we'll tell you who wins when the voting period finishes, your submission id is " + saveVoteResp.docId,
                    data: saveVoteResp.isVoteStored
                }); else reqUtils.respond(res, null, saveVoteResp.error);
            });
        });

    return rockstarRouter;
};