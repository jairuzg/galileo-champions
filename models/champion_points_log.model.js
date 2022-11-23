const {Sequelize, DataTypes, INTEGER, NOW} = require('sequelize');
const creds = require('../config/mysql_credentials.json');
const {ChampionPoints} = require("./champion_points.model");
const sequelize = new Sequelize(`mysql://${creds.username}:${creds.password}@${creds.host}:${creds.port}/${creds.database}`)

const ChampionPointsLog = sequelize.define('ChampionPointsLog', {
    lrcsLog: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'lrcs_log'
    },
    lrcs: {
        type: DataTypes.INTEGER,
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
    tableName: 'lrc_student_log',
    timestamps: false
});

ChampionPoints.hasMany(ChampionPointsLog, {sourceKey: 'lrcs', foreignKey: 'lrcs'});
ChampionPointsLog.belongsTo(ChampionPoints, {foreignKey: 'lrcs'});

module.exports = {
    ChampionPointsLog: ChampionPointsLog
};