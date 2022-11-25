const {emailTransport, EMAIL_SENDER} = require("../../admin/email_sender");
const {getResetPasswordLinkHTMLTemplate} = require("./templates/reset_password.html");
const {getPasswordConfirmationHTMLTemplate} = require("./templates/password_confirmation.html");

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

const sendPasswordConfirmationEmail = async (recipient, validationLink) => {
    let error, emailSubmitted;
    await emailTransport.sendMail({
        from: EMAIL_SENDER,
        to: recipient,
        subject: "Valida tu correo",
        text: 'Confirma tu cuenta con nosotros',
        html: getPasswordConfirmationHTMLTemplate(validationLink)
    }).then(info => {
        emailSubmitted = info;
    }).catch(err => {
        error = err;
    });
    return {error, emailSubmitted}
};

module.exports = {
    sendForgotPasswordEmail: sendForgotPasswordEmail,
    sendPasswordConfirmationEmail: sendPasswordConfirmationEmail
};