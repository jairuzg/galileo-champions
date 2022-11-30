const {ChampionPoints} = require("../../models/champion_points.model");
const {HTTP_STATUS} = require("../../common/constants");
const {RequestError} = require("../../controllers/request_utils.controller");
const appUtils = require("../../common/utils");

const assignChampionPoints = async (championPointsRequest) => {
    let error, arePointsAssigned, championPointsModel;
    try {
        championPointsModel = await ChampionPoints.findOne({
            where: {
                lrc: championPointsRequest.lrc,
                student: championPointsRequest.student,
                year: appUtils.getCurrentDateObject().year
            }
        });
        if (!championPointsModel) championPointsModel = await ChampionPoints.create({
            lrc: championPointsRequest.lrc,
            student: championPointsRequest.student,
            year: appUtils.getCurrentDateObject().year,
            points: championPointsRequest.points,
            reason: championPointsRequest.reason,
            modifiedBy: championPointsRequest.lecturer
        }); else await championPointsModel.update({
            points: championPointsModel.points + championPointsRequest.points,
            reason: championPointsRequest.reason
        });
        if (!championPointsModel) throw new RequestError("There was an error while trying to do the champion points assignment",
            {code: HTTP_STATUS.INTERNAL_SERVER_ERROR});
        arePointsAssigned = true;
    } catch (e) {
        error = e;
    }
    return {error, arePointsAssigned};
};


module.exports = {
    assignChampionPoints: assignChampionPoints
};

// let championPointsRequest = {
//     lrc: 1,
//     student: 'jairo+test13@galileo.edu',
//     year: 2022,
//     points: -3,
//     reason: 'Correccion por asignacion erronea',
//     lecturer: 'axel.benavides@galileo.edu'
// };
//
// assignChampionPoints(championPointsRequest).then(r=>{
//     console.log(r);
// });