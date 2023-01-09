const config = require('../../config.json')
const axios = require('axios')
const session = require('express-session')
const mongodb_callback = require('../../models/mongodb')
const mysql_callback = require('../../models/mysql')
const qs = require('qs')

exports.GetCode = async (req, res) => {
    try {
        const access_token_uri = `https://facebook.com/v15.0/dialog/oauth?client_id=${config.FB.client_id}&redirect_uri=https://jh.jp.ngrok.io/facebook/oauth&state={"code":"thisiscode"}`
        res.redirect(access_token_uri)
    } catch (e) {
        if (e) throw e
    }
}

token = []
exports.GetAccessToken = async (req, res) => {
    try {
        const { code } = req.query
        const GetAccessTokenUri = `https:////graph.facebook.com/v15.0/oauth/access_token?client_id=${config.FB.client_id}&redirect_uri=https://jh.jp.ngrok.io/facebook/oauth&client_secret=${config.FB.client_secret}&code=${code}`
        const access_token = await axios({
            url: GetAccessTokenUri
        })

        token[0] = access_token.data
        res.redirect('/facebook/user')
    } catch (e) {
        if (e) throw e
    }
}

exports.GetUserData = async (req, res) => {
    try {
        const UserFilter = {}
        const UserIdUri = `https://graph.facebook.com/me?access_token=${token[0].access_token}`
        const UserId = await axios({
            url: UserIdUri
        })

        const UserDataUri = `https://graph.facebook.com/${UserId.data.id}?fields=id,name,email&access_token=${token[0].access_token}`
        const UserData = await axios({
            url: UserDataUri
        })

        const total_data = UserData.data
        const username = UserData.data.name
        const useremail = UserData.data.email
        const location = "facebook"

        req.session.facebook = token

        const checkUser = await mongodb_callback.CheckUser(username, location)

        if (checkUser) {
            const userdata = await mongodb_callback.Userdata(username, location)

            if (userdata.email) {
                const result = {
                    name: userdata.name,
                    email: userdata.email
                }

                res.render('facebook_mypage', { data: result })
            } else {
                const result = {
                    name: userdata.name,
                    email: "비공개"
                }

                res.render('facebook_mypage', { data: result })
            }
        } else {
            UserFilter.total_data = total_data
            UserFilter.name = username
            UserFilter.email = useremail
            UserFilter.location = location

            mongodb_callback.SignIn(UserFilter)
            mysql_callback.Mysql_SignIn(total_data, username, useremail, location)
            if (!useremail) {
                const result = {
                    name: username,
                    email: "비공개"
                }
                res.render('facebook_mypage', { data: result })
            } else {
                const result = {
                    name: username,
                    email: useremail
                }
                res.render('facebook_mypage', { data: result })
            }
        }
    } catch (e) {
        if (e) throw e
    }
}

exports.Logout = async (req, res) => {
    try {
        const LogOutUri = `https://www.facebook.com/logout.php`
        const logout = await axios({
            url: `${LogOutUri}`,
            method: 'post',
            data : {
              next : `https://jh.jp.ngrok.io/facebook/logout`,
              access_token : `${token[0].access_token}`  
            },
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