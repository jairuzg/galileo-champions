const {User} = require("../../models/user.model");
const {
    SALT,
    STUDENT_ROLE,
    ADMIN_ROLE,
    LECTURER_ROLE,
    EMAIL_PROVIDER,
    HTTP_STATUS,
    GOOGLE_PROVIDER
} = require("../../common/constants");

const bcryptjs = require('bcryptjs');
const {Op, Sequelize} = require("sequelize");
const {RequestError} = require("../../controllers/request_utils.controller");

const getUserByEmailAndPassword = async (email, password) => {
    let user, error;
    await User.findOne({where: {email: email}}).then(userModel => {
        if (userModel) {
            if (!userModel.isVerified) throw new RequestError("Email verification missing", {code: HTTP_STATUS.UNAUTHORIZED});
            if (bcryptjs.compareSync(password, userModel.password ? userModel.password : "")) {
                user = userModel;
            } else {
                throw new RequestError("Password doesn't match", {code: HTTP_STATUS.BAD_REQUEST})
            }
        } else {
            throw new RequestError("User doesn't exist", {code: HTTP_STATUS.NOT_FOUND});
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
            const hash = user.password ? bcryptjs.hashSync(user.password, SALT) : null;
            if (!user.password && user.provider !== GOOGLE_PROVIDER) {
                throw new RequestError("Password can't be empty", {code: HTTP_STATUS.BAD_REQUEST});
            }
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
            error = new RequestError("User already exists", {code: HTTP_STATUS.CONFLICT});
        }
    } catch (ex) {
        error = ex;
    }

    return {error, registeredUser};
}

const searchUsersByCriteriaAndRole = async (criteria, role) => {
    let error, users;
    try {
        const userModel = await User.findAll({
            attributes: ['email', 'firstname', 'lastname'],
            where: Sequelize.where(Sequelize.fn("concat", Sequelize.col("firstname"), " ", Sequelize.col("lastname"), " ", Sequelize.col('email')),
                Op.like, `%${criteria}%`),
            limit: 5
        }, {plain: true});
        if (userModel) users = userModel;
        else error = new Error("Users not found with given criteria");
    } catch (ex) {
        error = ex;
    }
    return {error, users};
}

const searchStudentsByCriteria = async (criteria) => {
    let error, students;
    try {
        const usersSearch = await searchUsersByCriteriaAndRole(criteria, STUDENT_ROLE);
        if (!usersSearch.error) students = usersSearch.users
        else error = new Error("Users not found");
    } catch (ex) {
        return error = ex;
    }
    return {error, students};
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

const createAdminUser = async (email, firstname, lastname, password) => {
    let error, adminUser;
    try {
        const hash = bcryptjs.hashSync(password, SALT);
        adminUser = await User.create({
            email: email,
            firstname: firstname,
            lastname: lastname,
            password: hash,
            isVerified: true,
            provider: EMAIL_PROVIDER,
            role: ADMIN_ROLE
        });

    } catch (e) {
        error = e;
    }
    return {error, adminUser};
};

const getUserByEmail = async (email) => {
    let error, user;
    try {
        user = await User.findByPk(email);
        if (!user) throw new RequestError("User doesn't exist", {code: HTTP_STATUS.NOT_FOUND});
    } catch (e) {
        error = e;
    }
    return {error, user};
}

const checkUserExists = async (email) => {
    let error, userExists;
    try {
        const user = await User.findByPk(email);
        if (user) userExists = true;
        else throw new RequestError("User not found", {code: HTTP_STATUS.NOT_FOUND});
    } catch (e) {
        error = e;
    }
    return {error, userExists};
};

module.exports = {
    getUserByEmailAndPassword: getUserByEmailAndPassword,
    registerUser: registerUser,
    searchStudentsByCriteria: searchStudentsByCriteria,
    createAdminUser: createAdminUser,
    getUserByEmail: getUserByEmail,
    checkUserExists: checkUserExists
};