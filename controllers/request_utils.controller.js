const {HTTP_STATUS} = require("../common/constants");
const {validationResult} = require("express-validator");

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new RequestError("There was an error with your request", {
            message: "There was an error with your request",
            code: HTTP_STATUS.BAD_REQUEST,
            errors: errors.mapped()
        });
    }
}

class RequestError extends Error {
    constructor(message, options) {
        super(message, options);
        this.code = options.code ? options.code : HTTP_STATUS.INTERNAL_SERVER_ERROR;
        this.errors = options.errors ? options.errors : undefined;
    }
}

const respond = (res, obj, err) => {
    let responseObj = {
        success: err ? false : true,
        message: (obj && obj.message) ? obj.message : err.message
    };
    if (err && err.errors) responseObj.errors = err.errors;
    if (obj && obj.data) responseObj.data = obj.data;
    res.status((obj && obj.code) ? obj.code : (err && err.code) ? err.code : HTTP_STATUS.INTERNAL_SERVER_ERROR).json(responseObj);
}

module.exports = {
    validateRequest: validateRequest,
    RequestError: RequestError,
    respond: respond
};