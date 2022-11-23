const yargs = require('yargs');
const userService = require("../services/users/user.service");

yargs.version('1.1.0')

yargs.command({
    command: 'create-admin',
    describe: 'Creates a user of type admin that will be able to login into the application as administrator',
    builder: {
        email: {
            describe: 'Admin email',
            demandOption: true,
            type: 'string'
        },
        firstname: {
            describe: 'Admin firstname',
            demandOption: true,
            type: 'string'
        },
        lastname: {
            describe: 'Admin lastname',
            demandOption: true,
            type: 'string'
        },
        password: {
            describe: 'Admin password',
            demandOption: true,
            type: 'string'
        }
    },

    handler(argv) {
        userService.createAdminUser(argv.email, argv.firstname, argv.lastname, argv.password).then(adminResp => {
            if (adminResp.error) console.error("There was an error while trying to create the admin user " + adminResp.error.message);
            else console.log("Successfully created the admin, you can now use it to login into the system");
        });
    }
});

yargs.parse();