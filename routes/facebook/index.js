const router = require('express').Router()
const controller = require('./controller')

router.get('/auth', controller.GetCode)
router.get('/oauth', controller.GetAccessToken)
router.get('/user', controller.GetUserData)
router.post('/logout', controller.Logout)

module.exports = router