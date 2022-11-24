const express = require('express');
const authenticator = require("../services/auth/authenticator.service");
const {body} = require("express-validator");
const reqUtils = require("./request_utils.controller");
const authService = require("../services/auth/authenticator.service");
const {HTTP_STATUS} = require("../common/constants");
const userService = require("../services/users/user.service");
const authRouter = express.Router();

module.exports = (app) => {
    authRouter.post("/register", authenticator.registerUser);

    authRouter.post("/login", app.oauth.grant(), authenticator.login);

    authRouter.post("/login-web",
        body('email').isEmail(),
        body('password').isString().notEmpty(),
        (req, res, next) => {
            reqUtils.validateRequest(req, res, next);
            userService.getUserByEmailAndPassword(req.body.email, req.body.password).then(getUserResp => {
                if (!getUserResp.error) {
                    reqUtils.respond(res, {
                        message: "Authentication success",
                        data: getUserResp.user,
                        code: HTTP_STATUS.OK
                    });
                } else reqUtils.respond(res, null, getUserResp.error);
            })
        });

    authRouter.post('/reset-password-link',
        body('email').exists().withMessage('Email parameter is required').bail()
            .isEmail().notEmpty().withMessage("Email can't be empty")
        , (req, res, next) => {
            reqUtils.validateRequest(req, res, next);
            authService.generateResetPasswordHash(req.body.email).then(resetPasswordResp => {
                if (!resetPasswordResp.error) {
                    reqUtils.respond(res, {
                        code: HTTP_STATUS.OK,
                        message: "Successfully submitted your request to reset your password"
                    });
                } else {
                    reqUtils.respond(res, null, resetPasswordResp.error);
                }
            });
        });

    authRouter.get('/validate-reset-token/:token', (req, res) => {
        authService.validateResetToken(req.params.token).then(validationResp => {
            if (!validationResp.error && validationResp.tokenIsValid) reqUtils.respond(res, {
                code: HTTP_STATUS.OK,
                message: "The token is valid",
                data: validationResp.tokenIsValid
            });
            else reqUtils.respond(res, null, validationResp.error);
        })
    });

    authRouter.post('/reset-password',
        body('token').isString().exists().withMessage('The reset password token is required'),
        body('password').isString().exists().withMessage('The password field is required'),
        (req, res) => {
            authService.validateResetToken(req.body.token).then(validationResp => {
                if (validationResp.tokenIsValid) {
                    authService.resetPasswordByToken(req.body.password, req.body.token).then(resetPasswordResp => {
                        if (resetPasswordResp.isPasswordReset)
                            reqUtils.respond(res, {
                                code: HTTP_STATUS.OK,
                                message: "The password was reset successfully",
                                data: resetPasswordResp.isPasswordReset
                            });
                        else reqUtils.respond(res, null, resetPasswordResp.error);
                    });
                } else reqUtils.respond(res, null, validationResp.error);
            })
        })
    return authRouter;
}