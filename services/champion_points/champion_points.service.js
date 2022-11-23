const {ChampionPoints} = require("../../models/champion_points.model");
const {getCurrentDateObject} = require("../../common/utils");
const {RedemptionCenter} = require("../../models/redemption_center.model");
const {LecturerRedemptionCenter} = require("../../models/lecturer_redemption_center.model");
const sequelize = require("sequelize");
const {ChampionPointsLog} = require("../../models/champion_points_log.model");
const {RequestError} = require("../../controllers/request_utils.controller");
const {HTTP_STATUS} = require("../../common/constants");

const getChampionPointsByStudent = async (studentEmail) => {
    let error, championPoints;
    try {
        const championPointsModel = await ChampionPoints.findAll({
            where: {
                student: studentEmail,
                year: getCurrentDateObject().year
            },
            include: {model: LecturerRedemptionCenter, include: RedemptionCenter}
        });
        if (championPointsModel) {
            championPoints = championPointsModel.map(championPoint => {
                return {
                    id: championPoint.lrcs,
                    redemptionCenter: championPoint.LecturerRedemptionCenter.RedemptionCenter.name,
                    student: championPoint.student,
                    year: championPoint.year,
                    points: championPoint.points,
                    reason: championPoint.reason,
                    modifiedBy: championPoint.modifiedBy,
                    modifiedAt: championPoint.modifiedAt
                }
            });
        } else error = new RequestError("No champion points found ", {code: HTTP_STATUS.NOT_FOUND});
    } catch (ex) {
        error = ex;
    }
    return {error, championPoints};
}

const getSumOfChampionPointsByStudent = async (studentEmail) => {
    let error, championPoints;
    try {
        championPoints = await ChampionPoints.findOne({
            where: {student: studentEmail, year: getCurrentDateObject().year},
            attributes: [[sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('points')), 0), 'championPoints']],
            raw: true
        });
    } catch (ex) {
        return error = ex;
    }
    return {error, championPoints};
}

const getChampionPointsDetails = async (championPointsId) => {
    const championPointsModel = await ChampionPoints.findByPk(championPointsId, {
        include: [
            {model: ChampionPointsLog},
            {model: LecturerRedemptionCenter, include: RedemptionCenter}
        ]
    });
    if (championPointsModel) {
        const championPoints = {
            id: championPointsModel.lrcs,
            redemptionCenter: championPointsModel.LecturerRedemptionCenter.RedemptionCenter.name,
            student: championPointsModel.student,
            year: championPointsModel.year,
            points: championPointsModel.points,
            reason: championPointsModel.reason,
            modifiedBy: championPointsModel.modifiedBy,
            modifiedAt: championPointsModel.modifiedAt,
            logs: championPointsModel.ChampionPointsLogs.map(log => {
                return {
                    id: log.lrcsLog,
                    points: log.points,
                    reason: log.reason,
                    modifiedBy: log.modifiedBy,
                    modifiedAt: log.modifiedAt
                }
            })
        }
        return {error: null, championPoints};
    } else {
        return {error: new RequestError(`Champion Points with ID ${championPointsId} doesn't exist`, {code: HTTP_STATUS.NOT_FOUND})}
    }

}

module.exports = {
    getChampionPointsByStudent: getChampionPointsByStudent,
    getSumOfChampionPointsByStudent: getSumOfChampionPointsByStudent,
    getChampionPointsDetails: getChampionPointsDetails
}