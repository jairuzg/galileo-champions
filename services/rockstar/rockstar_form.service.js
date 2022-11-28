const {fbConn} = require("../../config/firebase.config");
const rockstarPeriodService = require("./rockstar_period.service");
const {RequestError} = require("../../controllers/request_utils.controller");
const {HTTP_STATUS} = require("../../common/constants");
const jq = require('node-jq');
const {TOP_ROCKSTAR_STUDENTS_LIMIT, ADMIN_EMAIL} = require("../../config/app_config");
const {ChampionRockstar} = require("../../models/champion_rockstar.model");
const {getEpochTime} = require("../../common/utils");
const emailService = require("../email/email.service");


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
        } else throw new RequestError("We're sorry, you can't vote more than once per Rockstar period", {code: HTTP_STATUS.BAD_REQUEST});
    } catch (e) {
        error = e;
    }
    return {error, canVote};
}

const getPeriodVotesByAnyDate = async (anyDate) => {
    let error, votes;
    try {
        const someDatePeriodResp = await rockstarPeriodService.getCurrentPeriodByAnyDate(anyDate);
        if (someDatePeriodResp.error) throw someDatePeriodResp.error;
        const rockstarPeriod = someDatePeriodResp.rockstarPeriod;
        const querySnapshot = await fbConn.collection("rockstarForm")
            .doc(rockstarPeriod.rockstarPeriod.toString()).collection(rockstarPeriod.rockstarPeriod.toString()).get();
        if (querySnapshot.empty) throw new RequestError("There are no votes in this period yet", {code: HTTP_STATUS.NOT_FOUND});
        votes = [];
        querySnapshot.forEach(doc => {
            votes.push(doc.data());
        });
    } catch (e) {
        error = e;
    }
    return {error, votes};
};

const getTopRockstarStudentsByPeriodDate = async (anyDate) => {
    let error, topThreeVoted;
    try {
        const periodVotesResp = await getPeriodVotesByAnyDate(anyDate);
        if (periodVotesResp.error) throw periodVotesResp.error;
        const countedVotes = await jq.run(' group_by(.nominatedEmail) | map({ nominatedEmail: .[0].nominatedEmail, nominationCount: map(.nominatedEmail) | length}) | sort_by(.nominationCount) | reverse', periodVotesResp.votes, {
            input: 'json',
            output: 'json'
        });
        topThreeVoted = (countedVotes.length < TOP_ROCKSTAR_STUDENTS_LIMIT) ? countedVotes : countedVotes.slice(0, TOP_ROCKSTAR_STUDENTS_LIMIT);
    } catch (e) {
        error = e;
    }
    return {error, topThreeVoted};
};

const saveTopRockstarStudentsByAnyDate = async (anyDate) => {
    let error, isSaved, periodByAnyDateResp;
    try {
        periodByAnyDateResp = await rockstarPeriodService.getCurrentPeriodByAnyDate(anyDate);
        if (periodByAnyDateResp.error) throw periodByAnyDateResp.error;
        const topRockstarResp = await getTopRockstarStudentsByPeriodDate(anyDate);
        if (topRockstarResp.error) throw topRockstarResp.error;
        const championRockstarStudents = topRockstarResp.topThreeVoted.map(votedRockstar => {
            return {
                student: votedRockstar.nominatedEmail,
                rockstarPeriod: periodByAnyDateResp.rockstarPeriod.rockstarPeriod,
                nominationCount: votedRockstar.nominationCount
            }
        });
        const championRockstarModels = await ChampionRockstar.bulkCreate(championRockstarStudents);
        if (championRockstarModels) {
            const rockstarEmail = await emailService.sendTopRockstarJobDoneEmail(ADMIN_EMAIL, championRockstarStudents, periodByAnyDateResp.rockstarPeriod);
            if (rockstarEmail.error) throw rockstarEmail.error;
            isSaved = true;
        } else throw new Error("There was an error and we couldn't save the rockstar students in the system");
    } catch (e) {
        await emailService.sendTopRockstarJobErrorEmail(ADMIN_EMAIL,
            e.message, periodByAnyDateResp ? periodByAnyDateResp.rockstarPeriod : {representation: ''});
        error = e;
    }
    return {error, isSaved};
}

const isUserRockstarOfLastPeriod = async (email) => {
    let error, isRockstar;
    try {
        const rockstarPeriodResp = await rockstarPeriodService.getLastPeriod();
        if (rockstarPeriodResp.error) throw rockstarPeriodResp.error;
        const championRockstar = await ChampionRockstar.findOne({
            where: {rockstarPeriod: rockstarPeriodResp.lastPeriod.rockstarPeriod, student: email}
        });
        if (!championRockstar) throw new RequestError("The user is not a Rockstar winner yet", {code: HTTP_STATUS.NOT_FOUND});
        else isRockstar = true;
    } catch (e) {
        error = e;
    }
    return {error, isRockstar};
};

module.exports = {
    saveRockstarFormVote: saveRockstarFormVote,
    verifyIfVoterCanVote: verifyIfVoterCanVote,
    saveTopRockstarStudentsByAnyDate: saveTopRockstarStudentsByAnyDate,
    isUserRockstarOfLastPeriod: isUserRockstarOfLastPeriod
};