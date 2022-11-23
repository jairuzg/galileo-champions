const {emailTransport, EMAIL_SENDER} = require("../../admin/email_sender");
const {getResetPasswordLinkHTMLTemplate} = require("./templates/reset_password.html");

const sendForgotPasswordEmail = async (destinatary, resetLink, deviceName) => {
    let error, emailSubmitted;
    await emailTransport.sendMail({
        from: EMAIL_SENDER,
        to: destinatary,
        subject: "Reinicia tu contraseña",
        text: 'Solicitaste un reinicio de contraseña',
        html: getResetPasswordLinkHTMLTemplate(resetLink, deviceName)
    }).then(info => {
        emailSubmitted = info;
    }).catch(err => {
        error = err;
    });
    return {error, emailSubmitted}
};

module.exports = {
    sendForgotPasswordEmail: sendForgotPasswordEmail
};