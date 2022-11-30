const {User} = require("../../models/user.model");
const {STUDENT_ROLE, HTTP_STATUS} = require("../../common/constants");
const rockstarPeriodService = require("../rockstar/rockstar_period.service");
const {ChampionRockstar} = require("../../models/champion_rockstar.model");
const {RequestError} = require("../../controllers/request_utils.controller");
const {assignChampionPoints} = require("../champion_points/lecturer-points-assignment.service");
const {ROCKSTAR_CHAMPION_POINTS, orm, ROCKSTAR_CHAMPION_POINTS_REASON} = require("../../config/app_config");
const {Sequelize} = require("sequelize");

const fetchStudentsEmailsArray = async () => {
    let error, emails = [];
    try {
        const emailsModel = await User.findAll({attributes: ['email'], where: {role: STUDENT_ROLE}, raw: true});
        emailsModel.map(emailModel => {
            emails.push(emailModel.email);
        });
    } catch (e) {
        error = e;
    }
    return {error, emails};
}

const getRockstarStudentsFromLastPeriod = async () => {
    let error, rockstarChampions;
    try {
        const periodResp = await rockstarPeriodService.getLastPeriod();
        if (periodResp.error) throw periodResp.error;
        rockstarChampions = await ChampionRockstar.findAll({
            where: {rockstarPeriod: periodResp.lastPeriod.rockstarPeriod}
        });
        if (!rockstarChampions || !rockstarChampions.length) throw new RequestError("There are no rockstars for the period yet", {code: HTTP_STATUS.NOT_FOUND});
    } catch (e) {
        error = e;
    }
    return {error, rockstarChampions};
};

const transferRockstarPointsToRedemptionCenter = async (championPointRequest) => {
    let error, isTransferred;
    const transaction = await orm.transaction();
    try {
        championPointRequest.points = parseInt(ROCKSTAR_CHAMPION_POINTS);
        championPointRequest.reason = ROCKSTAR_CHAMPION_POINTS_REASON;
        const championPointResp = await assignChampionPoints(championPointRequest);
        if (championPointResp.error) throw championPointResp.error;
        await ChampionRockstar.update(
            {redeemed: true},
            {where: {rockstarPeriod: championPointRequest.rockstarPeriod, student: championPointRequest.student}});
        await transaction.commit();
        isTransferred = true;
    } catch (e) {
        await transaction.rollback();
        error = e;
    }
    return {error, isTransferred};
};

module.exports = {
    fetchStudentsEmailsArray: fetchStudentsEmailsArray,
    getRockstarStudentsFromLastPeriod: getRockstarStudentsFromLastPeriod,
    transferRockstarPointsToRedemptionCenter: transferRockstarPointsToRedemptionCenter
};