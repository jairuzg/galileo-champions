const {Sequelize, DataTypes} = require('sequelize');
const dbCreds = require("../config/mysql_credentials.json");
const {User} = require("./user.model");
const sequelize = new Sequelize(`mysql://${dbCreds.username}:${dbCreds.password}@${dbCreds.host}:${dbCreds.port}/${dbCreds.database}`);

const PasswordReset = sequelize.define("PasswordReset", {
    passwordReset: {
        field: 'password_reset',
        type: DataTypes.BIGINT,
        primaryKey: true
    },
    user: {
        type: DataTypes.STRING
    },
    token: {
        type: DataTypes.STRING
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        default: DataTypes.NOW
    }
}, {
    tableName: 'password_reset',
    timestamps: false
});

User.hasMany(PasswordReset, {sourceKey: 'email', foreignKey: 'user'});
PasswordReset.belongsTo(User, {foreignKey: 'user'});

module.exports = {
    PasswordReset: PasswordReset
};