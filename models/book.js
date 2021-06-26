const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  publisher: String,
  author: String,
  imageURL: String,
  grade: Number,
  lessons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
    },
  ],
  created_date: {
    type: Date,
    default: Date.now,
  },
});

const Book = mongoose.model('Book', BookSchema);

module.exports = Book;
