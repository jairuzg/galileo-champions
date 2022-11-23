const {User} = require("../../models/user.model");
const {STUDENT_ROLE} = require("../../common/constants");

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

module.exports = {
    fetchStudentsEmailsArray: fetchStudentsEmailsArray
};