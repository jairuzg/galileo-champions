const {DataTypes} = require('sequelize');
const {orm} = require('../config/app_config');

const RockstarPeriod = orm.define('RockstarPeriod', {
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
    representation: {
        type: DataTypes.VIRTUAL,
        get() {
            return `(${this.periodFrom} - ${this.periodTo})`;
        }
    }
}, {
    tableName: 'rockstar_period',
    timestamps: false
});

module.exports = {
    RockstarPeriod: RockstarPeriod
};