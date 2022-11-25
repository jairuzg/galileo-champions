module.exports = {
    SALT: 10,
    EMAIL_PROVIDER: 'email',
    GOOGLE_PROVIDER: 'google',
    STUDENT_ROLE: 1,
    LECTURER_ROLE: 2,
    ADMIN_ROLE: 3,
    PASSWORD_CONFIRMATION: {
        VALIDATION: 'validation',
        RESET_PASSWORD: 'reset'
    },
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        IM_USED: 226,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        NOT_FOUND: 404,
        CONFLICT: 409,
        INTERNAL_SERVER_ERROR: 500,
    }
};