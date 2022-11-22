const express = require('express');
const authenticator = require("../services/auth/authenticator.service");
const authRouter = express.Router();

module.exports = (app) => {
    authRouter.post("/register", authenticator.registerUser);
    authRouter.post("/login", app.oauth.grant(), authenticator.login);
    return authRouter;
}