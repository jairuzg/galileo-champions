const {Sequelize, DataTypes} = require('sequelize');
const creds = require("../config/mysql_credentials.json");
const {RockstarPeriod} = require("./rockstar_period.model");
const sequelize = new Sequelize(`mysql://${creds.username}:${creds.password}@${creds.host}:${creds.port}/${creds.database}`);

const ChampionRockstar = sequelize.define('ChampionRockstar', {
    championRockstar: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'champion_rockstar'
    },
    student: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'student'
    },
    rockstarPeriod: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'rockstar_period'
    },
    googleSheetUrl: {
        type: DataTypes.STRING(1000),
        allowNull: false,
        field: 'google_sheet_url'
    },
    nominationCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'nomination_count',
        defaultValue: 0
    }
}, {
    tableName: 'champion_rockstar',
    timestamps: false
});

RockstarPeriod.hasMany(ChampionRockstar, {sourceKey: 'rockstarPeriod', foreignKey: 'rockstarPeriod'});
ChampionRockstar.belongsTo(RockstarPeriod, {foreignKey: 'rockstarPeriod'})

module.exports = {
    ChampionRockstar: ChampionRockstar
};