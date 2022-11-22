const {HTTP_STATUS} = require("./constants");

function errorHandler() {
    return function (err, req, res, next) {
        if (!(err instanceof Error)) return next(err);
        res.status(err.code ? err.code : HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: err.message
        });
    };
};

function getEpochTime() {
    return Math.floor(new Date().getTime() / 1000);
}

module.exports = {
    errorHandler: errorHandler,
    getEpochTime: getEpochTime
};