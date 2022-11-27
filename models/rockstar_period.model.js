const {DataTypes, Sequelize} = require('sequelize');
const creds = require("../config/mysql_credentials.json");
const sequelize = new Sequelize(`mysql://${creds.username}:${creds.password}@${creds.host}:${creds.port}/${creds.database}`);

const RockstarPeriod = sequelize.define('RockstarPeriod', {
    rockstarPeriod: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'rockstar_period'
    },
    periodFrom: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'period_from'
    },
    periodTo: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'period_to'
    },
}, {
    tableName: 'rockstar_period',
    timestamps: false
});

module.exports = {
    RockstarPeriod: RockstarPeriod
};