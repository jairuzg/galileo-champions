const {fbConn} = require("../../config/firebase.config");
const rockstarPeriodService = require("./rockstar_period.service");


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

module.exports = {
    saveRockstarFormVote: saveRockstarFormVote
};