const mysql = require('mysql');
const credentials = require('./../config/mysql_credentials.json')

const conn = mysql.createConnection({
    host: credentials.host,
    user: credentials.username,
    password: credentials.password,
    database: credentials.database
});

module.exports = {
    connMysql: conn
};