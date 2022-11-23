const express = require('express');
const {HTTP_STATUS, STUDENT_ROLE} = require("../common/constants");
const cpService = require("../services/champion_points/champion_points.service");
const {checkRequiredPermissions} = require("../services/auth/authenticator.service");
const reqUtils = require("./request_utils.controller");
const cpRouter = express.Router();

module.exports = (app) => {
    cpRouter.get('/champion-points', app.oauth.authorise(), checkRequiredPermissions([STUDENT_ROLE]), (req, res) => {
        cpService.getChampionPointsByStudent(req.user.email).then(getPointsResp => {
            if (!getPointsResp.error)
                reqUtils.respond(res, {
                    message: `Champion points for the student ${req.user.email}`,
                    data: getPointsResp.championPoints,
                    code: HTTP_STATUS.OK
                });
            else reqUtils.respond(res, null, getPointsResp.error);
        });
    });

    cpRouter.get('/champion-points/sum', app.oauth.authorise(), checkRequiredPermissions([STUDENT_ROLE]), (req, res) => {
        cpService.getSumOfChampionPointsByStudent(req.user.email).then(getSumOfCPResp => {
            if (!getSumOfCPResp.error)
                reqUtils.respond(res, {
                    message: `Champion points for the student ${req.user.email}`,
                    code: HTTP_STATUS.OK,
                    data: getSumOfCPResp.championPoints
                });
            else reqUtils.respond(res, null, getSumOfCPResp.error);
        });
    });

    cpRouter.get('/champion-points/:championPointsId', app.oauth.authorise(), checkRequiredPermissions([STUDENT_ROLE]), (req, res) => {
        cpService.getChampionPointsDetails(req.params.championPointsId).then(cpDetailsResp => {
            if (!cpDetailsResp.error)
                reqUtils.respond(res, {
                    code: HTTP_STATUS.OK,
                    message: `Champion points details for the student ${req.user.email}`,
                    data: cpDetailsResp.championPoints
                });
            else reqUtils.respond(res, null, cpDetailsResp.error);
        });
    });

    return cpRouter;
}