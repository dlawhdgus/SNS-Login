const router = require('express').Router()
const controller = require('./controller')

router.get('/auth',controller.GetCode)
router.get('/oauth',controller.GetToken)
router.get('/oauth/user',controller.GetUSerdata)
router.post('/logout',controller.LogOut)

module.exports = router