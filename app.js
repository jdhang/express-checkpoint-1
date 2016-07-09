'use strict'

var express = require('express');
var path = require('path')
var bodyParser = require('body-parser')
var session = require('express-session')
var app = express();

// serve static files
app.use('/files', express.static(__dirname + '/public/static/'))

// use body parser middleeware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// use sessions
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

// setting api routes
app.use('/api', require('./routes/api.router.js'))

// handle internal server errors
app.use('/broken', function (req, res, next) {
  res.sendStatus(500)
})

// throw custom error
app.use('/forbidden', function (req, res, next) {
  let err = new Error('You Shall Not Pass!!')
  err.status = 403
  next(err)
})

// handle custom errors
app.use(function (err, req, res, next) {
  res.sendStatus(err.status || 500)
})

module.exports = app;
