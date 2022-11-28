const userService = require('../users/user.service');
const jwt = require('jsonwebtoken');
const {JWT_SECRET_KEY, API_KEY} = require("../../config/app_config");
const {HTTP_STATUS, SALT, PASSWORD_CONFIRMATION, EMAIL_PROVIDER, GOOGLE_PROVIDER} = require("../../common/constants");
const {getEpochTime} = require("../../common/utils");
const bcryptjs = require("bcryptjs");
const {PasswordConfirmation} = require("../../models/password_confirmation.model");
const {RequestError} = require("../../controllers/request_utils.controller");
const emailService = require("../email/email.service");
const {User} = require("../../models/user.model");
const googleAuthService = require("./google_auth.service");

const registerUser = async (req, res) => {
    const resp = await registerUserWithEmailConfirmation(req.body);
    if (!resp.error) {
        let message = "User created successfully , no needed email verification.";
        if (resp.isValidationRequested) message = "User created successfully, email verification sent";
        sendResponse(res, message);
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
            let err = new Error("Error: Insufficient permission to access this resource, check your role");
            err.code = HTTP_STATUS.UNAUTHORIZED;
            throw err;
        } else {
            return next();
        }
    };
};

const validateApiKey = () => {
    return (req, res, next) => {
        const requestApiKey = req.headers['X-GC-API-KEY'] || req.headers['x-gc-api-key'];
        if (requestApiKey && requestApiKey === API_KEY) {
            return next();
        } else {
            console.error("API KEY is invalid");
            throw new RequestError("Error: Insufficient permission to access this resource", {code: HTTP_STATUS.UNAUTHORIZED});
        }
    }
};

const extractPayload = (req) => {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (!(typeof authHeader === undefined)) {
        const bearer = authHeader.split(" ");
        const bearerToken = bearer[1];
        return jwt.verify(bearerToken, JWT_SECRET_KEY);
    }
};

const generateResetPasswordHash = async (email, deviceName) => {
    let error, passwordConfirmation;
    try {
        const userExistsResp = await userService.checkUserExists(email);
        if (userExistsResp.error) throw new RequestError("That email address doesn't exist in our records", {code: HTTP_STATUS.NOT_FOUND});
        const text = email + getEpochTime();
        const hash = (bcryptjs.hashSync(text, SALT)).replace(/\//g, '');
        passwordConfirmation = await PasswordConfirmation.create({
            passwordConfirmation: getEpochTime(),
            user: email,
            token: hash,
            type: PASSWORD_CONFIRMATION.RESET_PASSWORD
        });
        if (!passwordConfirmation) throw Error("Couldn't create the password reset link ");

        const emailResp = await emailService.sendForgotPasswordEmail(email, hash, deviceName);
        if (emailResp.error && !emailResp.emailSubmitted) {
            await passwordConfirmation.destroy();
            throw new Error("There was an issue while sending the reset password link email to the recipient");
        }
    } catch (e) {
        error = e;
    }
    return {error, passwordConfirmation};
};

const validateResetToken = async (token) => {
    let error, tokenIsValid, passwordConfirmation;
    try {
        passwordConfirmation = await PasswordConfirmation.findOne({
            where: {token: token, type: PASSWORD_CONFIRMATION.RESET_PASSWORD},
            order: [['passwordConfirmation', 'DESC']],
            plain: true,
            include: User
        });
        if (passwordConfirmation) {
            const createdAt = new Date(passwordConfirmation.createdAt);
            const today = new Date();
            const hoursPassed = Math.abs(today - createdAt) / 36e5;
            tokenIsValid = hoursPassed <= 24;
            if (!tokenIsValid) {
                await passwordConfirmation.destroy()
                throw new RequestError("The token is no longer valid, already expired, you need to ask for a new token", {code: HTTP_STATUS.BAD_REQUEST});
            }
        } else throw new RequestError("There was an error while trying to validate your link or the link is expired or doesn't exist", {code: HTTP_STATUS.NOT_FOUND});
    } catch (e) {
        error = e;
    }
    return {error, tokenIsValid, passwordConfirmation};
};

const resetPasswordByToken = async (password, token) => {
    let error, isPasswordReset;
    try {
        const tokenValidation = await validateResetToken(token);
        if (tokenValidation.error) throw tokenValidation.error;
        const passwordConfirmation = tokenValidation.passwordConfirmation;
        if (passwordConfirmation) {
            const user = passwordConfirmation.User;
            const hashedPassword = bcryptjs.hashSync(password, SALT);
            await user.update({
                password: hashedPassword
            });
            await passwordConfirmation.destroy();
            isPasswordReset = true;
        } else throw new Error("The password reset link doesn't exist");
    } catch (e) {
        error = e;
    }
    return {error, isPasswordReset};
};

const registerUserWithEmailConfirmation = async (user) => {
    let error, isValidationRequested, passwordConfirmation, isUserCreated, newUser;
    try {
        const userResp = await userService.registerUser(user);
        if (userResp.error) throw Error("Couldn't create the user. " + userResp.error.message);
        isUserCreated = true;
        if (!user.isVerified) {
            const text = user.email + getEpochTime();
            const hash = (bcryptjs.hashSync(text, SALT)).replace(/\//g, '');
            passwordConfirmation = await PasswordConfirmation.create({
                'passwordConfirmation': getEpochTime(),
                user: user.email,
                token: hash,
                type: PASSWORD_CONFIRMATION.VALIDATION
            });
            if (!passwordConfirmation) throw Error("Couldn't create the password confirmation link ");

            const emailResp = await emailService.sendPasswordConfirmationEmail(user.email, hash);
            if (!emailResp.error && !emailResp.emailSubmitted) {
                await passwordConfirmation.destroy();
                await userResp.registeredUser.destroy();
                if (passwordConfirmation) await passwordConfirmation.destroy();
                throw new Error("There was an issue while sending the account confirmation link email to the recipient");
            }
            isValidationRequested = true;
        } else if(user.provider === GOOGLE_PROVIDER) {
            await googleAuthService.generateTokenNewUser(user).then(async (geTokenResp) => {
                if (!geTokenResp.error) {
                    user.accessToken = geTokenResp.accessToken.token;
                    newUser = user;
                } else {
                    await user.destroy();
                    throw new Error("There was an issue while generating an access token for the registered user, you will have to register again");
                }
            });
        }
    } catch (e) {
        error = e;
    }
    return {error, isValidationRequested, isUserCreated, newUser};
}

const confirmAccountWithToken = async (token) => {
    let error, isAccountValidated;
    try {
        const passwordConfirmation = await PasswordConfirmation.findOne({
            where: {token: token, type: PASSWORD_CONFIRMATION.VALIDATION},
            order: [['passwordConfirmation', 'DESC']],
            include: User,
            plain: true
        });
        if (passwordConfirmation) {
            const createdAt = new Date(passwordConfirmation.createdAt);
            const today = new Date();
            const hoursPassed = Math.abs(today - createdAt) / 36e5;
            isAccountValidated = hoursPassed <= 24;
            if (!isAccountValidated) {
                const user = passwordConfirmation.User;
                await passwordConfirmation.destroy();
                await user.destroy();
                throw new RequestError("The token is no longer valid, already expired, you need to create the account again", {code: HTTP_STATUS.BAD_REQUEST});
            } else {
                const user = passwordConfirmation.User;
                await user.update({
                    isVerified: true,
                    provider: EMAIL_PROVIDER
                });
                await passwordConfirmation.destroy();
            }
        } else throw new RequestError("There was an error while trying to validate your link or the link is expired or doesn't exist", {code: HTTP_STATUS.NOT_FOUND});
    } catch (e) {
        error = e;
    }
    return {error, isAccountValidated};
};

module.exports = {
    registerUser: registerUser,
    login: login,
    checkRequiredPermissions: checkRequiredPermissions,
    generateResetPasswordHash: generateResetPasswordHash,
    validateResetToken: validateResetToken,
    resetPasswordByToken: resetPasswordByToken,
    validateApiKey: validateApiKey,
    registerUserWithEmailConfirmation: registerUserWithEmailConfirmation,
    confirmAccountWithToken: confirmAccountWithToken,
    extractPayloadFromReq: extractPayload
};