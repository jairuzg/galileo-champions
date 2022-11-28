const {HTTP_STATUS} = require("../../common/constants");
const {RequestError} = require("../../controllers/request_utils.controller");
const {AccessToken} = require("../../models/access_token.model");
const {JWT_SECRET_KEY} = require("../../config/app_config");
const jwt = require("jsonwebtoken");
const utils = require("../../common/utils");

const generateTokenNewUser = async (user) => {
    let error, accessToken;
    try {
        await generateToken(user, async (err1, token1) => {
            if (!err1) await saveAccessToken(token1, user, (err2, token2) => {
                if (!err2) accessToken = token2;
                else throw new RequestError("Couldn't save the token " + err2.message, {code: HTTP_STATUS.INTERNAL_SERVER_ERROR});
            }); else throw new RequestError("Couldn't generate the token " + err1.message, {code: HTTP_STATUS.INTERNAL_SERVER_ERROR});
        });
    } catch (e) {
        console.error(e);
        error = e;
    }
    return {error, accessToken};
};

const generateToken = async (user, done) => {
    try {
        let tokenModel = await AccessToken.findOne({
            where: {user: user.email}
        });
        if (tokenModel) return done(null, tokenModel.token);
        else {
            const jwtSecretKey = JWT_SECRET_KEY;
            return done(null, jwt.sign(user, jwtSecretKey));
        }
    } catch (ex) {
        done(ex, false);
    }
}

const saveAccessToken = async (accessToken, user, done) => {
    try {
        let tokenModel = await AccessToken.findOne({
            where: {user: user.email}
        });
        if (!tokenModel) tokenModel = await AccessToken.create({
            accessToken: utils.getEpochTime(),
            user: user.email,
            token: accessToken
        });
        if (tokenModel) return done(null, tokenModel);
        else return done(new Error("Couldn't generate the access token"), false);
    } catch (ex) {
        done(ex, false);
    }
}

module.exports = {
    generateTokenNewUser: generateTokenNewUser
};