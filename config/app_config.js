const env = require('dotenv').config();

module.exports = {
    FE_HOST_URL: process.env.FE_HOST_URL,
    HOST_URL: process.env.HOST_URL,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    TOKEN_HEADER_KEY: process.env.TOKEN_HEADER_KEY,
    GOOGLE_EMAIL_USERNAME: process.env.GOOGLE_GC_EMAIL_USERNAME,
    GOOGLE_EMAIL_PASSWORD: process.env.GOOGLE_GC_APP_PASSWORD,
    API_KEY: process.env.API_KEY
}