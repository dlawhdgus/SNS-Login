const mysql = require('../../mysql_connect')

exports.Mysql_SignIn = (total_data, name, email, location) => {
    const sql = `INSERT INTO Users (total_data,name,email,location) VALUES ('${JSON.stringify(total_data)}','${name}','${email}','${location}')`
    mysql.con.query(sql, (e, result) => { if (e) throw e })
}

exports.Mysql_UpdateUser = (total_data, name, location) => {
    const sql = `UPDATE Users SET total_data = ''${total_data} WHERE name='${name}',location='${location}'`
    mysql.con.query(sql, (e, result) => { if (e) throw e })
}