const {Sequelize, DataTypes} = require('sequelize');
const {Role} = require("./role.model");
const creds = require("../config/mysql_credentials.json");
const sequelize = new Sequelize(`mysql://${creds.username}:${creds.password}@${creds.host}:${creds.port}/${creds.database}`);

const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    firstname: {
        type: DataTypes.STRING
    },
    lastname: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        field: 'is_verified'
    },
    googleId: {
        type: DataTypes.STRING,
        field: 'google_id'
    },
    provider: {
        type: DataTypes.STRING(100)
    },
    role: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'user',
    timestamps: false
});

Role.hasMany(User, {sourceKey: 'role', foreignKey: 'role'})
User.belongsTo(Role, {foreignKey: 'role'})

module.exports = {
    User: User
};