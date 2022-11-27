const {fbConn} = require("../../config/firebase.config");
const rockstarPeriodService = require("./rockstar_period.service");
const {RequestError} = require("../../controllers/request_utils.controller");
const {HTTP_STATUS} = require("../../common/constants");


async function saveRockstarFormVote(rockstarForm) {
    let error, isVoteStored, docId;
    try {
        const currentPeriodResp = await rockstarPeriodService.getCurrentPeriod();
        if (currentPeriodResp.error) throw currentPeriodResp.error;
        const rockstarPeriod = currentPeriodResp.currentPeriod;
        const rockstarFormDoc = await fbConn.collection('rockstarForm')
            .doc(rockstarPeriod.rockstarPeriod.toString())
            .collection(rockstarPeriod.rockstarPeriod.toString()).add({
                nominatedEmail: rockstarForm.nominatedEmail,
                voterEmail: rockstarForm.voterEmail,
                reasonToNominate: rockstarForm.reasonToNominate
            });
        isVoteStored = true;
        docId = rockstarFormDoc.id;
    } catch (e) {
        error = e;
    }
    return {error, isVoteStored, docId};
}

async function verifyIfVoterCanVote(voterEmail) {
    let error, canVote;
    try {
        const currentPeriodResp = await rockstarPeriodService.getCurrentPeriod();
        if (currentPeriodResp.error) throw currentPeriodResp.error;
        const rockstarPeriod = currentPeriodResp.currentPeriod;
        const q = await fbConn.collection('rockstarForm')
            .doc(rockstarPeriod.rockstarPeriod.toString())
            .collection(rockstarPeriod.rockstarPeriod.toString())
            .where('voterEmail', '==', voterEmail);
        const snapshot = await q.get();
        if (snapshot.empty) {
            canVote = true;
        } else throw new RequestError("Sorry, you can't vote more than once", {code: HTTP_STATUS.BAD_REQUEST});
    } catch (e) {
        error = e;
    }
    return {error, canVote};
}

module.exports = {
    saveRockstarFormVote: saveRockstarFormVote,
    verifyIfVoterCanVote: verifyIfVoterCanVote
};
