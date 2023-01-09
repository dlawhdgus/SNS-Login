const config = require('../../config.json')
const axios = require('axios')
const session = require('express-session')
const mongodb_callback = require('../../models/mongodb')
const mysql_callback = require('../../models/mysql')

exports.NaverLogin = async (req, res) => {
    try {
        const naverurl = `https://nid.naver.com/oauth2.0/authorize?client_id=${config.naver_client_id}&response_type=code&redirect_uri=${config.naver_redirect_uri}`
        res.redirect(naverurl)
    } catch (e) {
        if (e) throw e
    }
}

naver_token = []

exports.GetNaverToken = async (req, res) => {
    try {
        const { code } = req.query
        const token = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${config.naver_client_id}&client_secret=${config.naver_client_secret}&code=${code}`
        const GetTokenURi = await axios(token)
        naver_token[0] = GetTokenURi.data
        res.redirect('/naver/mypage')
    } catch (e) {
        if (e) throw e
    }
}


exports.GetUserDataNaver = async (req, res) => {
    try {
        const GetNaverUserDataURL = `https://openapi.naver.com/v1/nid/me`
        const UserFilter = {}

        const GetNaverUserData = await axios({
            url: `${GetNaverUserDataURL}`,
            method: 'get',
            headers: {
                "Authorization": `Bearer ${naver_token[0].access_token}`
            }
        })

        const total_data = GetNaverUserData.data.response
        const username = GetNaverUserData.data.response.name
        const useremail = GetNaverUserData.data.response.email
        const location = "naver"
        const checkUser = await mongodb_callback.CheckUser(username, location)

        req.session.naver = naver_token

        if (checkUser) {
            const userdata = await mongodb_callback.Userdata(username, location)

            if (userdata.email) {
                const result = {
                    name: userdata.name,
                    email: userdata.email
                }

                res.render('naver_mypage', { data: result })
            } else {
                const result = {
                    name: userdata.name,
                    email: "비공개"
                }

                res.render('naver_mypage', { data: result })
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

            res.render('naver_mypage', { data: result })
        }
    } catch (e) {
        if (e) throw e
    }
}

exports.NaverLogout = async (req, res) => {
    try {
        const logout = `https://nid.naver.com/oauth2.0/token?grant_type=delete&client_id=${config.naver_client_id}&client_secret=${config.naver_client_secret}&access_token=${naver_token[0]}&service_provider=NAVER`
        const LogoutUrl = await axios({
            url: `${logout}`,
            method: 'post'
        })
        req.session.destroy(() => { })
        res.redirect('/')
    } catch (e) {
        if (e) throw e
    }
}