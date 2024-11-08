const mysqlPromise = require('mysql2/promise')

const connect = mysqlPromise.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_pqr',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = connect;