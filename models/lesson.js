const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  chapter: Number,
  title: String,
  vocabulary: [String],
  expressions: [String],
  created_date: {
    type: Date,
    default: Date.now,
  },
});

const Lesson = mongoose.model('Lesson', LessonSchema);

module.exports = Lesson;
