const {DataTypes} = require('sequelize');
const {RockstarPeriod} = require("./rockstar_period.model");
const {orm} = require('./../config/app_config');

const ChampionRockstar = orm.define('ChampionRockstar', {
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
    nominationCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'nomination_count',
        defaultValue: 0
    },
    redeemed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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