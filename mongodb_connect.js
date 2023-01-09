const config = require('./config.json')
const mongoose = require('mongoose')

mongoose.connect(config.mongodb.CONNECT_STRING,{
    dbName : 'db'
})

const db = mongoose.connection
exports.db_connect = db.once("open", () => {
    console.log('MongoDB Connected')
})

db.on("error", (e) => {if(e) console.log(e)})