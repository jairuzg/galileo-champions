const {LecturerRedemptionCenter} = require("../../models/lecturer_redemption_center.model");
const rockstarPeriodService = require("../rockstar/rockstar_period.service");
const {HTTP_STATUS} = require("../../common/constants");
const {RequestError} = require("../../controllers/request_utils.controller");
const {RedemptionCenter} = require("../../models/redemption_center.model");
const {User} = require("../../models/user.model");

const getCurrentLecturerRedemptionCenters = async (lecturer, anyDate) => {
    let error, lecturerRedemptionCenters;
    try {
        const periodResp = anyDate === undefined ? await rockstarPeriodService.getCurrentPeriod() : await rockstarPeriodService.getCurrentPeriodByAnyDate(anyDate);
        if (periodResp.error) throw periodResp.error;
        lecturerRedemptionCenters = await LecturerRedemptionCenter.findAll({
            where: {lecturer: lecturer, rockstarPeriod: periodResp.currentPeriod.rockstarPeriod},
            include: [RedemptionCenter]
        });
        if (!lecturerRedemptionCenters || !lecturerRedemptionCenters.length)
            throw new RequestError("There are no redemptions centers for this lecturer", {code: HTTP_STATUS.NOT_FOUND});
        lecturerRedemptionCenters = lecturerRedemptionCenters.map(lrc => {
            return {
                id: lrc.lrc,
                lecturer: lrc.lecturer,
                redemptionCenter: lrc.RedemptionCenter.name,
                rockstarPeriod: lrc.rockstarPeriod
            }
        });
    } catch (e) {
        error = e;
    }
    return {error, lecturerRedemptionCenters};
};

module.exports = {
    getCurrentLecturerRedemptionCenters: getCurrentLecturerRedemptionCenters
};