'use strict'

let router = require('express').Router()

router.use('/books', require('./books.router.js'))

router.get('/numVisits', function (req, res, next) {
  if (req.session.views !== undefined) {
    req.session.views++
  } else{
    req.session.views = 0
  }
  res.json({ number: req.session.views })
})

module.exports = router
