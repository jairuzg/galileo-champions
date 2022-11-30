const express = require('express');
const {checkRequiredPermissions} = require("../services/auth/authenticator.service");
const {LECTURER_ROLE, HTTP_STATUS} = require("../common/constants");
const {body} = require("express-validator");
const redemptionCenterService = require("../services/redemption_center/redemption-center.service");
const reqUtils = require("./request_utils.controller");
const redemptionCenterRouter = express.Router();

module.exports = (app) => {

    redemptionCenterRouter.get("/lecturer/redemption-centers", app.oauth.authorise(), checkRequiredPermissions([LECTURER_ROLE]),
        (req, res, next) => {
            redemptionCenterService.getCurrentLecturerRedemptionCenters(req.user.email).then(rcResp => {
                if (rcResp.error) return reqUtils.respond(res, null, rcResp.error);
                reqUtils.respond(res, {
                    code: HTTP_STATUS.OK,
                    message: "Successfully collected the redemption centers for the user " + req.user.email,
                    data: rcResp.lecturerRedemptionCenters
                });
            });
        });

    return redemptionCenterRouter;
}
