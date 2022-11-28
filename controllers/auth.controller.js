const express = require('express');
const authenticator = require("../services/auth/authenticator.service");
const {body, param} = require("express-validator");
const reqUtils = require("./request_utils.controller");
const authService = require("../services/auth/authenticator.service");
const {HTTP_STATUS} = require("../common/constants");
const userService = require("../services/users/user.service");
const authRouter = express.Router();

module.exports = (app) => {
    authRouter.post("/register", authenticator.registerUser);

    authRouter.post("/register-web",
        body('email').isEmail(),
        body('firstname').isString().notEmpty(),
        body('lastname').isString().notEmpty(),
        body('password').isString().notEmpty().optional(),
        body('isVerified').optional(),
        body('role').isNumeric().notEmpty().optional(),
        body('provider').isString().notEmpty().optional(),
        (req, res, next) => {
            reqUtils.validateRequest(req, res, next);
            authService.registerUserWithEmailConfirmation(req.body).then(registerWithEVResp => {
                if (registerWithEVResp.isUserCreated && !registerWithEVResp.error) {
                    let message = "User created successfully , no needed email verification.";
                    if (registerWithEVResp.isValidationRequested) message = "User created successfully, email verification sent";
                    reqUtils.respond(res, {
                        message: message,
                        code: HTTP_STATUS.OK,
                        data: registerWithEVResp.newUser ? registerWithEVResp.newUser : registerWithEVResp.isUserCreated
                    });
                } else reqUtils.respond(res, null, registerWithEVResp.error);
            });
        });

    authRouter.post("/login", app.oauth.grant(), authenticator.login);

    authRouter.post("/login-web",
        body('email').isEmail().notEmpty(),
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
            authService.resetPasswordByToken(req.body.password, req.body.token).then(resetPasswordResp => {
                if (resetPasswordResp.isPasswordReset)
                    reqUtils.respond(res, {
                        code: HTTP_STATUS.OK,
                        message: "The password was reset successfully",
                        data: resetPasswordResp.isPasswordReset
                    });
                else reqUtils.respond(res, null, resetPasswordResp.error);
            });
        });

    authRouter.get('/confirm-account/:token',
        param('token').isString().exists().withMessage('The confirmation email token is required'),
        (req, res, next) => {
            reqUtils.validateRequest(req, res, next);
            authService.confirmAccountWithToken(req.params.token).then(accountConfirmedResp => {
                if (!accountConfirmedResp.error && accountConfirmedResp.isAccountValidated)
                    reqUtils.respond(res, {
                        code: HTTP_STATUS.OK,
                        message: "Woohoo! your account is validated you can now login from the login page",
                        data: accountConfirmedResp.isAccountValidated
                    });
                else reqUtils.respond(res, null, accountConfirmedResp.error);
            })
        });

    return authRouter;
}