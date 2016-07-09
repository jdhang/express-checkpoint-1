'use strict'

let router = require('express').Router()
let Promise = require('sequelize').Promise
let Book = require('../models/book')
let Chapter = require('../models/chapter')

router.param('id', function (req, res, id) {
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

router.get('/', function (req, res) {
  let options = {}
  if (req.query) options = { where: req.query }
  Book.findAll(options)
  .then((books) => {
    res.send(books)
  })
})

router.post('/', function (req, res) {
  Book.create(req.body)
  .then((createdBook) => {
    res.status(201).send(createdBook)
  })
})

router.get('/:id', function (req, res) {
  res.send(req.requestedBook)
})

router.put('/:id', function (req, res) {
  req.requestedBook.update(req.body)
  .then((updatedBook) => {
    res.send(updatedBook)
  })
})

router.delete('/:id', function (req, res) {
  req.requestedBook.destroy()
  .then(() => {
    res.sendStatus(204)
  })
})

router.use('/:id/chapters', require('./chapters.router'))

module.exports = router
