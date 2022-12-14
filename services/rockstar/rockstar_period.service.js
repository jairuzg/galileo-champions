const {RockstarPeriod} = require("../../models/rockstar_period.model");
const {Op} = require("sequelize");
const {RequestError} = require("../../controllers/request_utils.controller");
const {HTTP_STATUS} = require("../../common/constants");
const {getEpochTime, getCurrentDateInDBFormat} = require("../../common/utils");

const createRockstarPeriod = async (dateFrom, dateTo) => {
    let error, rockstarPeriod;
    try {
        const collisionPeriod = await RockstarPeriod.findOne({
            where: {
                [Op.or]: [
                    {periodFrom: {[Op.between]: [dateFrom, dateTo]}},
                    {periodTo: {[Op.between]: [dateFrom, dateTo]}},
                    {
                        [Op.and]: [
                            {periodFrom: {[Op.lte]: dateFrom}},
                            {periodTo: {[Op.gte]: dateTo}}
                        ]
                    }
                ]
            }
        });
        if (collisionPeriod) throw new RequestError("There is a period which dates have conflict with the period you are trying to create", {code: HTTP_STATUS.CONFLICT});
        rockstarPeriod = await RockstarPeriod.create({
            rockstarPeriod: getEpochTime(),
            periodFrom: dateFrom,
            periodTo: dateTo
        });
    } catch (e) {
        error = e;
    }
    return {error, rockstarPeriod};
};

const getCurrentPeriod = async () => {
    let error, currentPeriod;
    try {
        const today = getCurrentDateInDBFormat();
        currentPeriod = await RockstarPeriod.findOne({
            where: {[Op.and]: [{periodFrom: {[Op.lte]: today}}, {periodTo: {[Op.gte]: today}}]}
        });
        if (!currentPeriod || !currentPeriod.rockstarPeriod) throw new RequestError("We couldn't find a current active period", {code: HTTP_STATUS.NOT_FOUND});
    } catch (e) {
        error = e;
    }
    return {error, currentPeriod};
}

const getLastPeriod = async () => {
    let error, lastPeriod;
    try{
        lastPeriod = await RockstarPeriod.findOne({order: [['rockstarPeriod','DESC']]});
        if (!lastPeriod) throw new RequestError("Couldn't find the rockstar period", {code: HTTP_STATUS.NOT_FOUND});
    }catch (e) {
        error = e;
    }
    return {error, lastPeriod};
};

const getCurrentPeriodByAnyDate = async (anyDate) => {
    let error, rockstarPeriod;
    try {
        rockstarPeriod = await RockstarPeriod.findOne({where: {[Op.and]: [{periodFrom: {[Op.lte]: anyDate}}, {periodTo: {[Op.gte]: anyDate}}]}});
        if (!rockstarPeriod || !rockstarPeriod.rockstarPeriod) throw new Error("Couldn't find any period that matches that date");
    } catch (e) {
        error = e;
    }
    return {error, rockstarPeriod};
};

module.exports = {
    createRockstarPeriod: createRockstarPeriod,
    getCurrentPeriod: getCurrentPeriod,
    getCurrentPeriodByAnyDate: getCurrentPeriodByAnyDate,
    getLastPeriod: getLastPeriod
};
