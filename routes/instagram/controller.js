const config = require('../../config.json')
const axios = require('axios')
const session = require('express-session')
const mongodb_callback = require('../../models/mongodb')
const mysql_callback = require('../../models/mysql')
const qs = require('qs')

exports.GetCode = async (req, res) => {
    const GetCodeUri = `https://api.instagram.com/oauth/authorize?client_id=${config.INSTA.client_id}&redirect_uri=https://jh.jp.ngrok.io/instagram/oauth&scope=user_profile&response_type=code`
    res.redirect(GetCodeUri)
}

token = []

exports.GetToken = async (req, res) => {
    try {
        const { code } = req.query
        const GetTokenUri = `https://api.instagram.com/oauth/access_token`
        const GetToken = await axios({
            url: `${GetTokenUri}`,
            method: 'post',
            data: qs.stringify({
                client_id: `${config.INSTA.client_id}`,
                client_secret: `${config.INSTA.client_secret}`,
                grant_type: `authorization_code`,
                redirect_uri: `https://jh.jp.ngrok.io/instagram/oauth`,
                code: `${code}`
            }),
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        })

        token[0] = GetToken.data
        console.log(GetToken)
        res.redirect('/instagram/oauth/user')
    } catch (e) {
        if (e) console.log(e.response.data)
    }
}

exports.GetUSerdata = async (req, res) => {
    const access_token = token[0].access_token
    const user_id = token[0].user_id
    const UserFilter = {}

    const UserData = await axios({ url: `https://graph.instagram.com/${user_id}?fields=id,username&access_token=${access_token}` })

    const location = 'instagram'
    const username = UserData.data.username
    const total_data = UserData.data
    const useremail = UserData.data.email
    const checkUser = await mongodb_callback.CheckUser(username, location)

    req.session.instagram = token

    if (checkUser) {
        const userdata = await mongodb_callback.Userdata(username, location)

        if (userdata.email) {
            const result = {
                name: userdata.name,
                email: userdata.email
            }

            res.render('instagram_mypage', { data: result })
        } else {
            const result = {
                name: userdata.name,
                email: "비공개"
            }

            res.render('instagram_mypage', { data: result })
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

        res.render('instagram_mypage', { data: result })
    }
}

exports.LogOut = async (req, res) => {
    try {
        const LogOutUri = `https://www.facebook.com/logout.php?next=https://jh.jp.ngrok.io/instagram/logout&access_token=${token[0].access_token}`
        const logout = await axios({
            url: LogOutUri,
            method: 'post'
        })
        req.session.destroy(() => { })
        res.redirect('/')
    } catch (e) {
        if (e) throw e
    }
}