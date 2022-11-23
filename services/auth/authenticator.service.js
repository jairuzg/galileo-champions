const userService = require('../users/user.service');
const jwt = require('jsonwebtoken');
const {JWT_SECRET_KEY} = require("../../config/app_config");
const {HTTP_STATUS} = require("../../common/constants");

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

module.exports = {
    registerUser: registerUser,
    login: login,
    checkRequiredPermissions: checkRequiredPermissions
};