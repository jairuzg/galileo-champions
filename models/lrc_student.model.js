const {Sequelize, DataTypes, INTEGER, NOW} = require('sequelize');
const {User} = require("./user.model");
const {LecturerRedemptionCenter} = require("./lecturer_redemption_center.model");
const creds = require('../config/mysql_credentials.json');
const sequelize = new Sequelize(`mysql://${creds.username}:${creds.password}@${creds.host}:${creds.port}/${creds.database}`)

const LrcStudent = sequelize.define('LrcStudent', {
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

LecturerRedemptionCenter.hasMany(LrcStudent, {sourceKey: 'lrc', foreignKey: 'lrc'});
LrcStudent.belongsTo(LecturerRedemptionCenter, {foreignKey: 'lrc'});

User.hasMany(LrcStudent, {sourceKey: 'email', foreignKey: 'student'});
LrcStudent.belongsTo(User, {foreignKey: 'student'});

User.hasMany(LrcStudent, {sourceKey: 'email', foreignKey: 'modifiedBy'});
LrcStudent.belongsTo(User, {foreignKey: 'modifiedBy'});

module.exports = {
    LrcStudent: LrcStudent
};