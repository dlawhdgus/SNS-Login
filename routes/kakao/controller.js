const config = require('../../config.json')
const axios = require('axios')
const session = require('express-session')
const mongodb_callback = require('../../models/mongodb')
const mysql_callback = require('../../models/mysql')

exports.GetKakaoCode = (req, res) => {
    try {
        const kakaoURI = `https://kauth.kakao.com/oauth/authorize?client_id=${config.kakao_clientID}&redirect_uri=${config.kakao_redirectUri}&response_type=code`
        res.redirect(kakaoURI)
    } catch (e) {
        if (e) throw e
    }
}

const token = []

exports.GetKakaoToken = async (req, res) => {
    try {
        const { code } = req.query

        const kakaotokenuri = `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${config.kakao_clientID}&redirect_url=${config.kakao_redirectUri}&code=${code}`
        const data = await axios(kakaotokenuri)

        token[0] = data.data
        res.redirect('/kakao/user')
    } catch (e) {
        if (e) throw e
    }
}

exports.GetUserData = async (req, res) => {
    try {
        const BearerToken = `Bearer ${token[0].access_token}`
        const GetUserDataURL = `https://kapi.kakao.com/v2/user/me`
        const UserFilter = {}

        req.headers.Authorization = BearerToken

        const userdata = await axios({
            url: `${GetUserDataURL}`,
            method: `get`,
            headers: { "Authorization": `${BearerToken}` }

        })

        const total_data = userdata.data
        const username = userdata.data.properties.nickname
        const useremail = userdata.data.kakao_account.email
        const location = "kakao"
        const checkUser = await mongodb_callback.CheckUser(username, location)

        req.session.kakao = token

        if (checkUser) {
            const userdata = await mongodb_callback.Userdata(username, location)

            if (userdata.email) {
                const result = {
                    name: userdata.name,
                    email: userdata.email
                }

                res.render('kakao_mypage', { data: result })
            } else {
                const result = {
                    name: userdata.name,
                    email: "비공개"
                }

                res.render('kakao_mypage', { data: result })
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

            res.render('kakao_mypage', { data: result })
        }
    } catch (e) {
        if (e) throw e
    }
}

exports.Logout = async (req, res) => {
    try {
        const KakaoLogoutUrl = `https://kapi.kakao.com/v1/user/logout`
        const logouturl = await axios({
            url: `${KakaoLogoutUrl}`,
            method: `post`,
            headers: {
                "Authorization": `Bearer ${token[0].access_token}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        req.session.destroy(() => { })
        res.redirect('/')
    } catch (e) {
        if (e) throw e
    }
}