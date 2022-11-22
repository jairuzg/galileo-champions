const {Sequelize, DataTypes} = require('sequelize');
const creds = require("../config/mysql_credentials.json");
const sequelize = new Sequelize(`mysql://${creds.username}:${creds.password}@${creds.host}:${creds.port}/${creds.database}`);

const RedemptionCenter = sequelize.define('RedemptionCenter', {
    redemptionCenter: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'redemption_center'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'name'
    },
    description: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'redemption_center',
    timestamps: false
});

module.exports = {
    RedemptionCenter: RedemptionCenter
};