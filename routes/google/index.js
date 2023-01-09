const router = require('express').Router()
const controller = require('./controller')

router.get('/auth', controller.GetCode)
router.get('/oauth', controller.GetToken)
router.get('/oauth/token', controller.GetUserData)
router.post('/logout', controller.GoogleLogout)

module.exports = router