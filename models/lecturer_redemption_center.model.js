const {Sequelize, DataTypes} = require('sequelize');
const {RedemptionCenter} = require("./redemption_center.model");
const {User} = require("./user.model");
const creds = require("../config/mysql_credentials.json");
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
        type: DataTypes.STRING,
        field: 'redemption_center',
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

module.exports = {
    LecturerRedemptionCenter: LecturerRedemptionCenter
};