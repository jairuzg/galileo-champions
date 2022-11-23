const {body, validationResult, query} = require("express-validator");
const express = require('express');
const userService = require('../services/users/user.service');
const {GOOGLE_PROVIDER, HTTP_STATUS, LECTURER_ROLE, ADMIN_ROLE} = require("../common/constants");
const {checkRequiredPermissions} = require("../services/auth/authenticator.service");
const controllerUtils = require("./request_utils.controller");
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
        (req, res)=>{
            controllerUtils.validateRequest(req, res);

        });

    return userRouter;
}