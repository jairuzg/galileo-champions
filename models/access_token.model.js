const {Sequelize, DataTypes} = require('sequelize');
const dbCreds = require('./../config/mysql_credentials.json');
const {User} = require("./user.model");
const sequelize = new Sequelize(`mysql://${dbCreds.username}:${dbCreds.password}@${dbCreds.host}:${dbCreds.port}/${dbCreds.database}`);

const AccessToken = sequelize.define('AccessToken', {
    accessToken: {
        type: DataTypes.NUMBER,
        primaryKey: true,
        field: 'access_token'
    },
    token: {
        type: DataTypes.TEXT,
        autoIncrement: false
    },
    user: {
        type: DataTypes.STRING,
        allowNull: false,
        autoIncrement: false
    }
}, {
    tableName: 'access_token',
    timestamps: false
});

User.hasMany(AccessToken, {sourceKey: 'email', foreignKey: 'user'});
AccessToken.belongsTo(User, {foreignKey: 'user'});

module.exports = {
    AccessToken: AccessToken
};