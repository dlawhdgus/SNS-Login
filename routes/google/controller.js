const axios = require('axios')
const session = require('express-session')
const config = require('../../config.json')
const mongodb_callback = require('../../models/mongodb')
const mysql_callback = require('../../models/mysql')

exports.GetCode = async (req, res) => {
    try {
        const code = `${config.web.auth_uri}?client_id=${config.web.client_id}&redirect_uri=${config.web.redirect_uris[0]}&response_type=code&scope=${config.web.scope}`
        res.redirect(code)
    } catch (e) {
        if (e) throw e
    }
}
token_data = []
exports.GetToken = async (req, res) => {
    try {
        const { code } = req.query
        const tokenuri = `${config.web.token_uri}?code=${code}&client_id=${config.web.client_id}&client_secret=${config.web.client_secret}&redirect_uri=${config.web.redirect_uris[0]}&grant_type=authorization_code`
        const token = await axios({
            url: `${tokenuri}`,
            method: 'post',
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        })
        token_data[0] = token.data
        res.redirect('/google/oauth/token')
    } catch (e) {
        if (e) console.log(e.response.data)
    }
}

exports.GetUserData = async (req, res) => {
    try {
        const user_data_uri = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token_data[0].access_token}`
        const user_data = await axios(user_data_uri)
        const UserFilter = {}

        const total_data = user_data.data
        const username = user_data.data.name
        const useremail = user_data.data.email
        const location = "google"

        const checkUser = await mongodb_callback.CheckUser(username, location)

        req.session.google = token_data

        if (checkUser) {
            const userdata = await mongodb_callback.Userdata(username, location)

            if (userdata.email) {
                const result = {
                    name: userdata.name,
                    email: userdata.email
                }

                res.render('google_mypage', { data: result })
            } else {
                const result = {
                    name: userdata.name,
                    email: "비공개"
                }

                res.render('google_mypage', { data: result })
            }
        } else {
            UserFilter.total_data = total_data
            UserFilter.name = username
            UserFilter.email = useremail
            UserFilter.location = location

            mongodb_callback.SignIn(UserFilter)
            mysql_callback.Mysql_SignIn(total_data, username, useremail, location)

            const result = {
                name: username,
                email: useremail
            }

            res.render('google_mypage', { data: result })
        }
    } catch (e) {
        if (e) throw e
    }
}

exports.GoogleLogout = async (req, res) => {
    try {
        const logouturl = `https://oauth2.googleapis.com/revoke?token=${token_data[0].access_token}`
        const logout = await axios({
            url: `${logouturl}`,
            method: 'post',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        req.session.destroy(() => { })
        res.redirect('/')
    } catch (e) {
        if (e) throw e
    }
}