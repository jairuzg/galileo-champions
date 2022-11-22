const {Sequelize, DataTypes} = require('sequelize');
const creds = require("../config/mysql_credentials.json");
const sequelize = new Sequelize(`mysql://${creds.username}:${creds.password}@${creds.host}:${creds.port}/${creds.database}`);

const Role = sequelize.define('Role', {
    role: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        unique: 'name'
    },
    description: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'role',
    timestamps: false
});

module.exports = {
    Role: Role
}