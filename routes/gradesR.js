const express = require("express"),
      router  = express.Router(),
{ Grade, Book } = require('../models');
      
router.route('/')
  .get(getGrades)
  .post(createGrade);
  
router.route('/:gradeID')
  .get(getBooks)
  .post(createBook)
  .put(updateGrade)
  .delete(deleteGrade);

function getGrades(req, res){
  Grade.find()
  .then(grades=>{
    res.json(grades);
  })
  .catch(err=>{
    res.send(err);
  });
}

function createGrade(req, res){
  Grade.create(req.body)
  .then(newGrade=>{
    res.status(201).json(newGrade);
  })
  .catch(err=>{
    res.send(err);
  });
}

function getBooks(req, res){
  Grade
  .findOne({_id: req.params.gradeID})
  .populate({
    path: 'books',
    select: ['publisher', 'author', 'imageURL', 'lessons'],
  })
  .exec((err, books)=>{
    if(err) return res.send(err);
    res.json(books);
  });
}

function createBook(req, res){
  Grade.findOne({_id: req.params.gradeID})
  .then(grade=>{
    Book.create(req.body)
    .then(newBook=>{
      grade.books.push(newBook);
      grade.save();
      res.status(201).json(grade);
    })
    .catch(err=>{
      res.send(err);
    });
  });
}

function updateGrade(req, res){
  Grade.findOneAndUpdate({_id: req.params.gradeID}, req.body, {new: true})
  .then(updatedGrade=>{
    res.send("Successfully Updated");
  })
  .catch(err=>{
    res.send(err);
  });
}

function deleteGrade(req, res){
  Grade.findOneAndDelete({_id:req.params.gradeID})
  .then(()=>{
    res.send('Successfully Deleted');
  })
  .catch(err=>{
    res.send(err);
  });
}

module.exports = router;