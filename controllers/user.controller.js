const {body, validationResult, query} = require("express-validator");
const express = require('express');
const userService = require('../services/users/user.service');
const {GOOGLE_PROVIDER, HTTP_STATUS, LECTURER_ROLE, ADMIN_ROLE} = require("../common/constants");
const {checkRequiredPermissions, validateApiKey} = require("../services/auth/authenticator.service");
const controllerUtils = require("./request_utils.controller");
const reqUtils = require("./request_utils.controller");
const userRouter = express.Router();

module.exports = (app) => {
    userRouter.post('/user',
        body('email').isEmail(),
        body('firstname').isString(),
        body('lastname').isString(),
        body('password').isString(),
        body('googleId').isString().notEmpty().optional(),
        (req, res) => {
            controllerUtils.validateRequest(req, res);
            let newUser = req.body;
            if (newUser.googleId) newUser.provider = GOOGLE_PROVIDER;
            userService.registerUser(newUser).then(registerUserResp => {
                if (!registerUserResp.error) {
                    res.status(HTTP_STATUS.OK).json({
                        success: true,
                        message: "User registered correctly"
                    });
                } else {
                    res.status(HTTP_STATUS.BAD_REQUEST).json({
                        success: false,
                        message: 'There was an error while trying to create a user',
                        error: registerUserResp.error.message
                    });
                }
            });
        }
    );

    userRouter.post('/user/lecturer', app.oauth.authorise(), checkRequiredPermissions([ADMIN_ROLE]), (req, res) => {
        let user = req.body;
        user.role = LECTURER_ROLE;
        userService.registerUser(user).then(registerUserResp => {
            if (!registerUserResp.error) {
                res.status(HTTP_STATUS.OK).json({
                    success: true,
                    message: "User registered correctly"
                });
            } else {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'There was an error while trying to create a user',
                    error: registerUserResp.error.message
                });
            }
        });
    });

    userRouter.post('/students/search',
        query('criteria').exists().withMessage("Field criteria is required").bail()
            .isString()
            .notEmpty().withMessage("Field criteria can't be empty"),
        (req, res) => {
            controllerUtils.validateRequest(req, res);
            userService.searchStudentsByCriteria(req.query.criteria).then(searchResult => {
                res.json(searchResult);
            });
        }
    );

    userRouter.post('/users/search',
        query('criteria').exists().withMessage("Field criteria is required").bail()
            .isString()
            .notEmpty().withMessage("Field criteria can't be empty"),
        (req, res) => {
            controllerUtils.validateRequest(req, res);

        });

    userRouter.get('/user/:email',
        body('email').isEmail().withMessage("Must provide a valid email address"),
        app.oauth.authorise(), checkRequiredPermissions([ADMIN_ROLE]),
        (req, res, next) => {
            reqUtils.validateRequest(req, res, next);
            userService.getUserByEmail(req.body.email).then(getUserResp => {
                if (!getUserResp.error) reqUtils.respond(res, {
                    message: "Successfully fetched the user.",
                    data: getUserResp.user,
                    code: HTTP_STATUS.OK
                }); else reqUtils.respond(res, null, getUserResp.error);
            });
        });

    userRouter.post('/user-exists',
        body('email').isEmail().withMessage("A valid email must be sent").exists(),
        validateApiKey(), (req, res, next) => {
            reqUtils.validateRequest(req, res, next);
            userService.checkUserExists(req.body.email).then(checkResp => {
                if (!checkResp.error && checkResp.userExists) reqUtils.respond(res, {
                    message: "User exists",
                    code: HTTP_STATUS.OK,
                    data: checkResp.userExists
                }); else reqUtils.respond(res, null, checkResp.error);

            });
        });

    return userRouter;
}