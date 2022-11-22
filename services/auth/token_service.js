const {AccessToken} = require("../../models/access_token.model");
const {getUserByEmailAndPassword} = require("../users/user.service");
const {ClientCredential} = require("../../models/client_credential.model");
const utils = require("../../common/utils");
const {User} = require("../../models/user.model");
const jwt = require('jsonwebtoken');
const {JWT_SECRET_KEY} = require("../../config/app_config");

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
        return getUserByEmailAndPassword(username, password).then(resp => {
            if (!resp.error) done(null, resp.user);
            else done(resp.error, false);
        });
    },
    saveAccessToken: (accessToken, clientID, expires, user, done) => {
        AccessToken.create({
            accessToken: utils.getEpochTime(),
            user: user.email,
            token: accessToken
        }).then(accessTokenModel => {
            if (accessTokenModel) done(null, accessTokenModel);
            else done(new Error("Couldn't generate the access token"), false);
        }).catch(ex => {
            done(ex, false);
        });
    },
    getAccessToken: (bearerToken, done) => {
        AccessToken.findOne({
            order: [['accessToken', 'DESC']],
            attributes: ['token', 'user']
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
    generateToken: (type, req, done) => {
        try {
            const user = req.user.dataValues;
            const jwtSecretKey = JWT_SECRET_KEY;
            done(null, jwt.sign(user, jwtSecretKey));
        } catch (ex) {
            done(ex, false);
        }
    }
}