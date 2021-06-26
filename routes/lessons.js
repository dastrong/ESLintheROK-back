const express = require('express'),
  router = express.Router({ mergeParams: true }),
  { Book, Lesson } = require('../models');

router
  .route('/:lessonID')
  .get(getLessonData)
  .put(updateLesson)
  .delete(deleteLesson);

function getLessonData(req, res) {
  Lesson.findOne({ _id: req.params.lessonID })
    .then(lesson => {
      res.json(lesson);
    })
    .catch(err => {
      res.send(err);
    });
}

function updateLesson(req, res) {
  Lesson.findOneAndUpdate({ _id: req.params.lessonID }, req.body, { new: true })
    .then(updatedLesson => {
      res.send('Successfully Updated');
    })
    .catch(err => {
      res.send(err);
    });
}

function deleteLesson(req, res) {
  Lesson.findOneAndDelete({ _id: req.params.lessonID })
    .then(() => {
      Book.findOne({ _id: req.params.bookID })
        .then(book => {
          const index = book.lessons.findIndex(
            lesson => lesson._id == req.params.lessonID
          );
          book.lessons.splice(index, 1);
          book.save();
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
