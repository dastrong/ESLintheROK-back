const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
  grade: Number,
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
    },
  ],
});

const Grade = mongoose.model('Grade', GradeSchema);

module.exports = Grade;
