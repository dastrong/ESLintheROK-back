const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const { Grade, Book, Lesson } = require('../models');

router.post('/book', createBook);
router.put('/book/:bookId', updateBook);
router.delete('/book/:bookId', deleteBook);
router.get('/book/:bookId/lessons', getBookLessons);

function createBook(req, res, next) {
  const { gradeId, ...bookBody } = req.body;
  Grade.findOne({ _id: gradeId })
    .then(grade => {
      Book.create(bookBody)
        .then(newBook => {
          grade.books.push(newBook);
          grade.save();
          res.status(201).json(grade);
        })
        .catch(next);
    })
    .catch(next);
}

function updateBook(req, res, next) {
  Book.findOneAndUpdate({ _id: req.params.bookId }, req.body, { new: true })
    .then(() => res.status(200).json({ message: 'Successfully Updated' }))
    .catch(next);
}

function deleteBook(req, res, next) {
  const bookId = req.params.bookId;
  const gradeId = req.body.gradeId;
  // if we don't have the gradeId throw an error
  if (!gradeId) return next(createError(400, 'Missing `gradeId`'));
  Book.findOneAndDelete({ _id: bookId })
    .then(() => {
      Grade.findOne({ _id: req.body.gradeId })
        .then(grade => {
          const index = grade.books.findIndex(book => book == bookId);
          grade.books.splice(index, 1);
          grade.save();
          res.status(200).json({ message: 'Successfully Deleted' });
        })
        .catch(next);
    })
    .catch(next);
}

function getBookLessons(req, res, next) {
  Book.findOne({ _id: req.params.bookId })
    .lean()
    .populate({
      path: 'lessons',
      select: ['chapter', 'title'],
    })
    .exec((err, lessons) => {
      if (err) return next(err);
      res.status(200).json(lessons);
    });
}

module.exports = router;
