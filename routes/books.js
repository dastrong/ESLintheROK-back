const express = require('express'),
  router = express.Router({ mergeParams: true }),
  { Grade, Book, Lesson } = require('../models');

router
  .route('/')
  .get(getLessonList)
  .post(createLesson)
  .put(updateBook)
  .delete(deleteBook);

function getLessonList(req, res) {
  Book.findOne({ _id: req.params.bookID })
    .populate({
      path: 'lessons',
      select: ['chapter', 'title'],
    })
    .exec((err, lessons) => {
      if (err) return res.send(err);
      res.json(lessons);
    });
}

function createLesson(req, res) {
  Book.findOne({ _id: req.params.bookID })
    .then(book => {
      Lesson.create(req.body)
        .then(newLesson => {
          book.lessons.push(newLesson);
          book.save();
          res.status(201).json(book);
        })
        .catch(err => {
          res.send(err);
        });
    })
    .catch(err => {
      res.send(err);
    });
}

function updateBook(req, res) {
  Book.findOneAndUpdate({ _id: req.params.bookID }, req.body, { new: true })
    .then(updatedBook => {
      res.send('Successfully Updated');
    })
    .catch(err => {
      res.send(err);
    });
}

function deleteBook(req, res) {
  Book.findOneAndDelete({ _id: req.params.bookID })
    .then(() => {
      Grade.findOne({ _id: req.params.gradeID })
        .then(grade => {
          const index = grade.books.findIndex(
            book => book == req.params.bookID
          );
          grade.books.splice(index, 1);
          grade.save();
          res.send('Successfully Deleted');
        })
        .catch(err => {
          res.send(err);
        });
    })
    .catch(err => {
      res.send(err);
    });
}

module.exports = router;
