const mysql = require('mysql2')

const connection = mysql.createConnection({
    host: '172.22.50.61',
    user:'remoto',
    password:'root',
    database:'db_pqr',
    port:3306
})


module.exports = connection;