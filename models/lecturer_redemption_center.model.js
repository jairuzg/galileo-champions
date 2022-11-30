const {Sequelize, DataTypes} = require('sequelize');
const {RedemptionCenter} = require("./redemption_center.model");
const {User} = require("./user.model");
const creds = require("../config/mysql_credentials.json");
const {RockstarPeriod} = require("./rockstar_period.model");
const sequelize = new Sequelize(`mysql://${creds.username}:${creds.password}@${creds.host}:${creds.port}/${creds.database}`);

const LecturerRedemptionCenter = sequelize.define('LecturerRedemptionCenter', {
    lrc: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    lecturer: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'lecturer'
    },
    redemptionCenter: {
        type: DataTypes.INTEGER,
        field: 'redemption_center',
        allowNull: false,
        unique: 'lecturer'
    },
    rockstarPeriod: {
        type: DataTypes.BIGINT,
        field: 'rockstar_period',
        allowNull: false,
        unique: 'lecturer'
    }
}, {
    tableName: 'lecturer_redemption_center',
    timestamps: false
});

User.hasMany(LecturerRedemptionCenter, {sourceKey: 'email', foreignKey: 'lecturer'});
LecturerRedemptionCenter.belongsTo(User, {foreignKey: 'lecturer'});

RedemptionCenter.hasMany(LecturerRedemptionCenter, {sourceKey: 'redemptionCenter', foreignKey: 'redemptionCenter'});
LecturerRedemptionCenter.belongsTo(RedemptionCenter, {foreignKey: 'redemptionCenter'});

RockstarPeriod.hasMany(LecturerRedemptionCenter, {sourceKey: 'rockstarPeriod', foreignKey: 'rockstarPeriod'});
LecturerRedemptionCenter.belongsTo(RockstarPeriod, {foreignKey: 'rockstarPeriod'});

module.exports = {
    LecturerRedemptionCenter: LecturerRedemptionCenter
};