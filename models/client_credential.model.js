const {Sequelize, DataTypes} = require('sequelize');
const dbCreds = require("../config/mysql_credentials.json");
const {User} = require("./user.model");
const sequelize = new Sequelize(`mysql://${dbCreds.username}:${dbCreds.password}@${dbCreds.host}:${dbCreds.port}/${dbCreds.database}`);

const ClientCredential = sequelize.define("ClientCredential", {
    clientId: {
        type: DataTypes.STRING,
        primaryKey: true,
        field: 'client_id'
    },
    clientSecret: {
        type: DataTypes.STRING,
        field: 'client_secret',
        unique: 'client_secret'
    },
    createdBy: {
        type: DataTypes.STRING,
        field: 'created_by'
    }
}, {
    tableName: 'client_credential',
    timestamps: false
});

User.hasMany(ClientCredential, {sourceKey: 'email', foreignKey: 'createdBy'});
ClientCredential.belongsTo(User, {foreignKey: 'createdBy'});

module.exports = {
    ClientCredential: ClientCredential
}