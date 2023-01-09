const router = require('express').Router()
const controller = require('./controller')

router.get('/auth', controller.GetKakaoCode)
router.get('/oauth', controller.GetKakaoToken)
router.get('/user', controller.GetUserData)
router.post('/logout', controller.Logout)

module.exports = router