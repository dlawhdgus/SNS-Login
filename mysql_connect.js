const mysql = require('mysql')
const config = require('./config.json')
const con = mysql.createConnection(config.mysql)

const connection = con.connect((e) => {
    if (e) throw e
    else console.log('Mysql Connected')
})

exports.connection = connection
exports.con = con