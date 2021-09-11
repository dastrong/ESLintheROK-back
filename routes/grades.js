const router = require('express').Router();
const Grade = require('../models/grade');
const Book = require('../models/book');

router.get('/grades', getAllGrades);
router.post('/grade', createGrade);
router.put('/grade/:gradeId', updateGrade);
router.delete('/grade/:gradeId', deleteGrade);
router.get('/grade/:gradeId/books', getGradeBooks);

function getAllGrades(req, res, next) {
  Grade.find()
    .select('grade books')
    .lean()
    .then(grades => res.status(200).json(grades))
    .catch(next);
}

function createGrade(req, res, next) {
  Grade.create(req.body)
    .then(newGrade => res.status(201).json(newGrade))
    .catch(next);
}

function updateGrade(req, res, next) {
  Grade.findOneAndUpdate({ _id: req.params.gradeId }, req.body, { new: true })
    .then(() => res.status(200).json({ message: 'Successfully Updated' }))
    .catch(next);
}

function deleteGrade(req, res, next) {
  Grade.findOneAndDelete({ _id: req.params.gradeId })
    .then(() => res.status(200).json({ message: 'Successfully Deleted' }))
    .catch(next);
}

function getGradeBooks(req, res, next) {
  Grade.findOne({ _id: req.params.gradeId })
    .lean()
    .populate({
      path: 'books',
      select: ['publisher', 'author', 'imageURL', 'lessons'],
    })
    .exec((err, books) => {
      if (err) return next(err);
      res.status(200).json(books);
    });
}

module.exports = router;
