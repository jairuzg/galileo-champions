const {Sequelize, DataTypes} = require('sequelize');
const dbCreds = require("../config/mysql_credentials.json");
const {User} = require("./user.model");
const {PASSWORD_CONFIRMATION} = require("../common/constants");
const sequelize = new Sequelize(`mysql://${dbCreds.username}:${dbCreds.password}@${dbCreds.host}:${dbCreds.port}/${dbCreds.database}`);

const PasswordConfirmation = sequelize.define("PasswordConfirmation", {
    passwordConfirmation: {
        field: 'password_confirmation',
        type: DataTypes.BIGINT,
        primaryKey: true
    },
    user: {
        type: DataTypes.STRING
    },
    token: {
        type: DataTypes.STRING
    },
    type: {
        type: DataTypes.STRING(50),
        validate: {
            isIn: [[PASSWORD_CONFIRMATION.VALIDATION, PASSWORD_CONFIRMATION.RESET_PASSWORD]]
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        default: DataTypes.NOW
    }
}, {
    tableName: 'password_confirmation',
    timestamps: false
});

User.hasMany(PasswordConfirmation, {sourceKey: 'email', foreignKey: 'user'});
PasswordConfirmation.belongsTo(User, {foreignKey: 'user'});

module.exports = {
    PasswordConfirmation: PasswordConfirmation
};