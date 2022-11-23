const {HTTP_STATUS} = require("./constants");

function errorHandler() {
    return function (err, req, res, next) {
        console.log("Que paso con esta excepcion ", err);
        if (!(err instanceof Error)) return next(err);
        res.status(err.code ? err.code : HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: err.message,
            errors: err.errors ? err.errors : []
        });
    };
};

function getEpochTime() {
    return Math.floor(new Date().getTime() / 1000);
}

function getCurrentDateObject() {
    const today = new Date();
    return {
        year: today.getFullYear(),
        month: today.getMonth(),
        day: today.getDay(),
        hour: today.getHours(),
        minute: today.getMinutes(),
        second: today.getSeconds()
    }
}

module.exports = {
    errorHandler: errorHandler,
    getEpochTime: getEpochTime,
    getCurrentDateObject: getCurrentDateObject
};