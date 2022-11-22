const crypto = require('crypto');
const bcryptjs = require('bcryptjs');
const {SALT} = require("../../common/constants");

const generateClientCredentials = () => {
    const clientId = generateClientId();
    const clientSecret = generateClientSecret();
    return {clientId, clientSecret};
}

const generateClientSecret = () => {
    const clientSecretText = crypto.randomUUID();
    const clientSecret = bcryptjs.hashSync(clientSecretText, SALT);
    return clientSecret;
}

const generateClientId = () => {
    const clientId = Math.floor(Math.random() * 0x7FFFFFFF) + "" + Math.floor(Date.now() / 1000);
    return clientId;
}

module.exports = {
    generateClientCredentials: generateClientCredentials,
    generateClientSecret: generateClientSecret
};