const router = require('express').Router()

const social = [
    '/kakao',
    '/naver',
    '/google',
    '/facebook',
    '/instagram'
]

social.forEach(path => router.use(path, require(`.${path}`)))

module.exports = router