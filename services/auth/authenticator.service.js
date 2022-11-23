const userService = require('../users/user.service');
const jwt = require('jsonwebtoken');
const {JWT_SECRET_KEY} = require("../../config/app_config");
const {HTTP_STATUS, SALT} = require("../../common/constants");
const {getEpochTime, getCurrentTimeInDBFormat} = require("../../common/utils");
const bcryptjs = require("bcryptjs");
const {PasswordReset} = require("../../models/password_reset.model");
const {RequestError} = require("../../controllers/request_utils.controller");
const emailService = require("../email/email.service");
const {User} = require("../../models/user.model");

const registerUser = async (req, res) => {
    const resp = await userService.registerUser(req.body);
    if (!resp.error) {
        sendResponse(res, "User created successfully.");
    } else {
        sendResponse(res, resp.error.message, resp.error)
    }
}

const login = (query, res) => {
};

function sendResponse(res, message, error) {
    res.status(error !== undefined ? 400 : 200).json({
        success: error === undefined,
        message: message,
        error: error,
    });
}

const checkRequiredPermissions = (requiredPermissions) => {
    return (req, res, next) => {
        const payload = extractPayload(req);
        const role = payload.role;

        const hasPermissions = requiredPermissions.includes(role);

        if (!hasPermissions) {
            let err = new Error("Error: Insufficient permission to access this resource");
            err.code = HTTP_STATUS.UNAUTHORIZED;
            throw err;
        } else {
            return next();
        }
    };
};

const extractPayload = (req) => {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (!(typeof authHeader === undefined)) {
        const bearer = authHeader.split(" ");
        const bearerToken = bearer[1];
        return jwt.verify(bearerToken, JWT_SECRET_KEY);
    }
}

const generateResetPasswordHash = async (email, deviceName) => {
    let error, passwordReset;
    try {
        const text = email + getEpochTime();
        const hash = (bcryptjs.hashSync(text, SALT)).replace(/\//g, '');
        passwordReset = await PasswordReset.create({
            passwordReset: getEpochTime(),
            user: email,
            token: hash
        });
        if (!passwordReset) throw Error("Couldn't create the password reset link ")

        const emailResp = await emailService.sendForgotPasswordEmail(email, hash, deviceName);
        if (emailResp.error && !emailResp.emailSubmitted) {
            await passwordReset.destroy();
            throw new Error("There was an issue while sending the reset password link email to the recipient");
        }
    } catch (e) {
        error = e;
    }
    return {error, passwordReset};
}

const validateResetToken = async (token) => {
    let error, tokenIsValid;
    try {
        const passwordReset = await PasswordReset.findOne({
            where: {token: token},
            order: [['passwordReset', 'DESC']],
            plain: true
        });
        if (passwordReset) {
            const createdAt = new Date(passwordReset.createdAt);
            const today = new Date();
            const hoursPassed = Math.abs(today - createdAt) / 36e5;
            tokenIsValid = hoursPassed <= 24;
            if (!tokenIsValid) {
                await passwordReset.destroy()
                throw new RequestError("The token is no longer valid, already expired, you need to ask for a new token", {code: HTTP_STATUS.BAD_REQUEST});
            }
        } else throw new RequestError("There was an error while trying to validate your link or the link is expired or doesn't exist", {code: HTTP_STATUS.NOT_FOUND});
    } catch (e) {
        error = e;
    }
    return {error, tokenIsValid};
}

const resetPasswordByToken = async (password, token) => {
    let error, isPasswordReset;
    try {
        const passwordReset = await PasswordReset.findOne({
            where: {token: token},
            attributes: ['user', 'passwordReset'],
            include: User,
            order: [['passwordReset', 'DESC']]
        });
        if (passwordReset) {
            const user = passwordReset.User;
            await passwordReset.destroy();
            const hashedPassword = bcryptjs.hashSync(password, SALT);
            await user.update({
                password: hashedPassword
            });
            isPasswordReset = true;
        } else throw new Error("The password reset link doesn't exist");
    } catch (e) {
        error = e;
    }
    return {error, isPasswordReset};
}
module.exports = {
    registerUser: registerUser,
    login: login,
    checkRequiredPermissions: checkRequiredPermissions,
    generateResetPasswordHash: generateResetPasswordHash,
    validateResetToken: validateResetToken,
    resetPasswordByToken: resetPasswordByToken
};