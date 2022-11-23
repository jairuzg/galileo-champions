const nodemailer = require('nodemailer');
const appConfig = require("../config/app_config");

const emailTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: appConfig.GOOGLE_EMAIL_USERNAME,
        pass: appConfig.GOOGLE_EMAIL_PASSWORD,
    },
});

module.exports = {
    emailTransport: emailTransport,
    EMAIL_SENDER: `Galileo Champions<${appConfig.GOOGLE_EMAIL_USERNAME}>`
};