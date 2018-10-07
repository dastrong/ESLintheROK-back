const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  chapter: Number,
  title: String,
  vocabulary: [{
    text: String,
    translation: String,
    imageURL: String
  }],
  expressions: [{
    text: String,
    translation: String,
    imageURL: String
  }],
  created_date: {
    type: Date,
    default: Date.now
  },
});

const Lesson = mongoose.model('Lesson', LessonSchema);

module.exports = Lesson;