const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const { Book, Lesson } = require('../models');

router.get('/lesson/:lessonId', getLessonData);
router.post('/lesson/:lessonId', createLesson);
router.put('/lesson/:lessonId', updateLesson);
router.delete('/lesson/:lessonId', deleteLesson);

function getLessonData(req, res, next) {
  Lesson.findOne({ _id: req.params.lessonId })
    .lean()
    .then(lesson => res.status(200).json(lesson))
    .catch(next);
}

function createLesson(req, res, next) {
  const { bookId, ...lessonBody } = req.body;
  Book.findOne({ _id: bookId })
    .then(book => {
      Lesson.create(lessonBody)
        .then(newLesson => {
          book.lessons.push(newLesson);
          book.save();
          res.status(201).json(book);
        })
        .catch(next);
    })
    .catch(next);
}

function updateLesson(req, res, next) {
  Lesson.findOneAndUpdate({ _id: req.params.lessonId }, req.body, { new: true })
    .then(() => res.status(200).json({ message: 'Successfully Updated' }))
    .catch(next);
}

function deleteLesson(req, res, next) {
  const lessonId = req.params.lessonId;
  const bookId = req.body.bookId;
  // if we don't have the bookId throw an error
  if (!bookId) return next(createError(400, 'Missing `bookId`'));
  Lesson.findOneAndDelete({ _id: lessonId })
    .then(() => {
      Book.findOne({ _id: bookId })
        .then(book => {
          const index = book.lessons.findIndex(
            lesson => lesson._id == lessonId
          );
          book.lessons.splice(index, 1);
          book.save();
          res.status(200).json({ message: 'Successfully Deleted' });
        })
        .catch(next);
    })
    .catch(next);
}

module.exports = router;
