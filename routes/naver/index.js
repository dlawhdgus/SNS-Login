const router = require('express').Router()
const controller = require('./controller')

router.get('/auth', controller.NaverLogin)
router.get('/oauth', controller.GetNaverToken)
router.get('/mypage', controller.GetUserDataNaver)
router.post('/logout', controller.NaverLogout)

module.exports = router