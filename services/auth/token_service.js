const {AccessToken} = require("../../models/access_token.model");
const {getUserByEmailAndPassword} = require("../users/user.service");
const {ClientCredential} = require("../../models/client_credential.model");
const utils = require("../../common/utils");
const jwt = require('jsonwebtoken');
const {JWT_SECRET_KEY} = require("../../config/app_config");
const {RequestError} = require("../../controllers/request_utils.controller");
const {HTTP_STATUS} = require("../../common/constants");

module.exports = {
    getClient: (clientID, clientSecret, done) => {
        ClientCredential.findByPk(clientID).then(ccModel => {
            const client = {
                clientID,
                clientSecret,
                grants: null,
                redirectUris: null,
            };
            if (!ccModel) done(new Error("Client ID doesn't exist"), false);
            else if (clientSecret === ccModel.clientSecret) {
                done(false, client);
            } else {
                done(new Error("Client secret doesn't match the client ID"), false);
            }
        }).catch(ex => {
            done(ex, false);
        });
    },
    grantTypeAllowed: (clientID, grantType, done) => {
        done(false, true);
    },
    getUser: (username, password, done) => {
        getUserByEmailAndPassword(username, password).then(resp => {
            if (resp.user && !resp.user.isVerified) {
                const error = new RequestError("Need to verify email address first!", {code: HTTP_STATUS.UNAUTHORIZED});
                return done(error, false);
            }
            if (!resp.error) return done(null, resp.user);
            else return done(resp.error, false);
        });
    },
    saveAccessToken: async (accessToken, clientID, expires, user, done) => {
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
    },
    getAccessToken: (bearerToken, done) => {
        AccessToken.findOne({
            order: [['accessToken', 'DESC']],
            attributes: ['token', 'user'],
            where: {token: bearerToken}
        }).then(accessTokenModel => {
            if (accessTokenModel && accessTokenModel.token === bearerToken) {
                const accessToken = {
                    user: {
                        email: accessTokenModel.user,
                    },
                    expires: null,
                };
                done(null, accessToken);
            } else done(Error("The access token is not valid"), false);
        }).catch(ex => {
            done(ex, false);
        });
    },
    generateToken: async (type, req, done) => {
        try {
            const user = req.user.dataValues;
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
}