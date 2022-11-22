const env = require('dotenv').config();

module.exports = {
    HOST_URL: process.env.HOST_URL,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    TOKEN_HEADER_KEY: process.env.TOKEN_HEADER_KEY
}