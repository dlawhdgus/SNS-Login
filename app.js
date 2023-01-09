const express = require('express')
const app = express()
const routes = require('./routes')
const config = require('./config.json')
const session = require('express-session')
const FileStroe = require('session-file-store')(session)
const bodyParser = require('body-parser')
const { Mongodb_connect } = require('./mongodb_connect')
const mysql = require('./mysql_connect')

app.use(session({
    secret: 'hsdalbvjhab;uvujb',
    resave: false,
    saveUninitialized: true,
    store: new FileStroe({ logFn: () => { } })
}))

app.get('/', (req, res) => {
    res.render('index')
})

app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'))
app.use('/', routes)
app.use(express.urlencoded({ extended: true }))

app.set('views', './public/views')
app.set('view engine', 'ejs')


app.listen(config.port, () => {
    console.log('https://jh.jp.ngrok.io  <- Server On!!')
    Mongodb_connect
    mysql.connection
})