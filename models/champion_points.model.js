const {Sequelize, DataTypes, INTEGER, NOW} = require('sequelize');
const {User} = require("./user.model");
const {LecturerRedemptionCenter} = require("./lecturer_redemption_center.model");
const creds = require('../config/mysql_credentials.json');
const sequelize = new Sequelize(`mysql://${creds.username}:${creds.password}@${creds.host}:${creds.port}/${creds.database}`)

const ChampionPoints = sequelize.define('ChampionPoints', {
    lrcs: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    lrc: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: 'lrc'
    },
    student: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'lrc'
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: 'lrc'
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        default: 0
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    modifiedBy: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'modified_by'
    },
    modifiedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'modified_at'
    }
}, {
    tableName: 'lrc_student',
    timestamps: false
});

LecturerRedemptionCenter.hasMany(ChampionPoints, {sourceKey: 'lrc', foreignKey: 'lrc'});
ChampionPoints.belongsTo(LecturerRedemptionCenter, {foreignKey: 'lrc'});

User.hasMany(ChampionPoints, {sourceKey: 'email', foreignKey: 'student'});
ChampionPoints.belongsTo(User, {foreignKey: 'student'});

User.hasMany(ChampionPoints, {sourceKey: 'email', foreignKey: 'modifiedBy'});
ChampionPoints.belongsTo(User, {foreignKey: 'modifiedBy'});

module.exports = {
    ChampionPoints: ChampionPoints
};