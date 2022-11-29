require('dotenv').config();
const {Sequelize} = require('sequelize');
const creds = require("./mysql_credentials.json");
const ormConfig = {
    "username": creds.username,
    "password": creds.password,
    "database": creds.database,
    "host": creds.host,
    "dialect": "mysql",
    "logging": process.env.ENVIRONMENT_MODE !== 'production'
};
const orm = new Sequelize(ormConfig);

module.exports = {
    FE_HOST_URL: process.env.FE_HOST_URL,
    HOST_URL: process.env.HOST_URL,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    TOKEN_HEADER_KEY: process.env.TOKEN_HEADER_KEY,
    GOOGLE_EMAIL_USERNAME: process.env.GOOGLE_GC_EMAIL_USERNAME,
    GOOGLE_EMAIL_PASSWORD: process.env.GOOGLE_GC_APP_PASSWORD,
    API_KEY: process.env.API_KEY,
    TOP_ROCKSTAR_STUDENTS_LIMIT: parseInt(process.env.TOP_ROCKSTAR_STUDENTS_LIMIT) || 3,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    orm: orm,
    ALLOWED_REGISTRATION_DOMAINS: process.env.ALLOWED_REGISTRATION_DOMAINS
}