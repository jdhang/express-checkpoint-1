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
app.use('/api', require('./routes/api.app.js'))

app.param('/api/book/id', function (req, res, id) {
  Book.findOne({ where: { id: id }})
  .then((book) => {
    if (book) {
      req.requestedBook = book
      next()
    } else {
      res.sendStatus(404)
    }
  })
})

app.get('/api/book', function (req, res) {
  let options = {}
  if (req.query) options = { where: req.query }
  Book.findAll(options)
  .then((books) => {
    res.send(books)
  })
})

app.post('/api/book', function (req, res) {
  Book.create(req.body)
  .then((createdBook) => {
    res.status(201).send(createdBook)
  })
})

app.get('/api/book/:id', function (req, res) {
  res.send(req.requestedBook)
})

app.put('/api/book/:id', function (req, res) {
  req.requestedBook.update(req.body)
  .then((updatedBook) => {
    res.send(updatedBook)
  })
})

app.delete('/api/book/:id', function (req, res) {
  req.requestedBook.destroy()
  .then(() => {
    res.sendStatus(204)
  })
})

app.param('/api/book/:id/chapters/:chapterId', function (req, res, chapterId) {
  Chapter.findOne({ where: { id: chapterId } })
  .then((chapter) => {
    if (chapter) {
      req.requestedChapter = chapter
      next()
    } else {
      res.sendStatus(404)
    }
  })
})

app.get('/api/book/:id/chapters/', function (req, res) {
  req.requestedBook.getChapters()
  .then((chapters) => {
    res.send(chapters)
  })
})

app.post('/api/book/:id/chapters/', function (req, res) {
  Chapter.create(req.body)
  .then((createdChapter) => {
    return Promise.all([
      req.requestedBook.addChapter(createdChapter),
      createdChapter.setBook(req.requestedBook)
    ])
  })
  .spread((book, chapter) => {
    res.status(201).send(chapter)
  })
})

app.get('/api/book/:id/chapters/:chapterId', function (req, res) {
  res.send(req.requestedChapter)
})

app.put('/api/book/:id/chapters/:chapterId', function (req, res) {
  req.requestedChapter.update(req.body)
  .then((updatedChapter) => {
    res.send(updatedChapter)
  })
})

app.delete('/api/book/:id/chapters/:chapterId', function (req, res) {
  req.requestedChapter.destroy()
  .then(() => {
    res.sendStatus(204)
  })
})

app.get('/numVisits', function (req, res, next) {
  if (req.session.views !== undefined) {
    req.session.views++
  } else{
    req.session.views = 0
  }
  res.json({ number: req.session.views })
})

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
