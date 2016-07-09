'use strict'

let router = require('express').Router()
let Chapter = require('../models/chapter')

router.param('chapterId', function (req, res, chapterId) {
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

router.get('/', function (req, res) {
  req.requestedBook.getChapters()
  .then((chapters) => {
    res.send(chapters)
  })
})

router.post('/', function (req, res) {
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

router.get('/:chapterId', function (req, res) {
  res.send(req.requestedChapter)
})

router.put('/:chapterId', function (req, res) {
  req.requestedChapter.update(req.body)
  .then((updatedChapter) => {
    res.send(updatedChapter)
  })
})

router.delete('/:chapterId', function (req, res) {
  req.requestedChapter.destroy()
  .then(() => {
    res.sendStatus(204)
  })
})

module.exports = router
