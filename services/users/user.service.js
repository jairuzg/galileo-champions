const {User} = require("../../models/user.model");
const {SALT, STUDENT_ROLE, ADMIN_ROLE, LECTURER_ROLE} = require("../../common/constants");

const bcryptjs = require('bcryptjs');

const getUserByEmailAndPassword = async (email, password) => {
    let user, error;
    await User.findOne({where: {email: email}}).then(userModel => {
        if (userModel) {
            if (bcryptjs.compareSync(password, userModel.password)) {
                user = userModel;
            }
        } else {
            throw new Error("User doesn't exist");
        }
    }).catch(ex => {
        error = ex;
    })
    return {error, user};
}

const registerUser = async (user) => {
    let registeredUser, error;
    try {
        const existingUser = await User.findByPk(user.email);
        if (!existingUser) {
            const hash = bcryptjs.hashSync(user.password, SALT);
            registeredUser = await User.create({
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                password: hash,
                isVerified: user.googleId ? true : user.isVerified ? user.isVerified : null,
                googleId: user.googleId ? user.googleId : null,
                provider: user.provider ? user.provider : null,
                role: user.role ? getRoleIdentifier(user.role) : STUDENT_ROLE
            });

        } else {
            error = new Error("User already exists");
        }
    } catch (ex) {
        error = ex;
    }

    return {error, registeredUser};
}

const getRoleIdentifier = (roleName) => {
    switch (roleName) {
        case 'student':
            return STUDENT_ROLE;
            break;
        case 'lecturer':
            return LECTURER_ROLE;
            break;
        case 'admin':
            return ADMIN_ROLE;
            break;
        default:
            return STUDENT_ROLE;
    }
}

module.exports = {
    getUserByEmailAndPassword: getUserByEmailAndPassword,
    registerUser: registerUser
};