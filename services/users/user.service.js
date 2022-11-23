const {User} = require("../../models/user.model");
const {SALT, STUDENT_ROLE, ADMIN_ROLE, LECTURER_ROLE, EMAIL_PROVIDER} = require("../../common/constants");

const bcryptjs = require('bcryptjs');
const {Op} = require("sequelize");

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

const searchUsersByCriteriaAndRole = async (criteria, role) => {
    let error, users;
    try {
        const userModel = await User.findAll({
            attributes: ['email', 'firstname', 'lastname'],
            where: {
                [Op.or]: [
                    {email: {[Op.like]: `%${criteria}%`}},
                    {firstname: {[Op.like]: `%${criteria}%`}},
                    {lastname: {[Op.like]: `%${criteria}%`}},
                ],
                role: role
            }
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

module.exports = {
    getUserByEmailAndPassword: getUserByEmailAndPassword,
    registerUser: registerUser,
    searchStudentsByCriteria: searchStudentsByCriteria,
    createAdminUser: createAdminUser
};