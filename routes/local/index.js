const router = require('express').Router()
const controller = require('./controller')

router.get('/sign-up_page', controller.sign_up)
router.post('/sign-up/register', controller.sign_up_register)

module.exports = router