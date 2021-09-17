const mongoose = require('mongoose');

const PastLessonSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    vocabulary: [String],
    expressions: [String],
    expires: {
      type: Date,
      default: () => Date.now() + 1000 * 60 * 60 * 24 * 182,
    },
  },
  { timestamps: true }
);

const PastLesson = mongoose.model('PastLesson', PastLessonSchema);

module.exports = PastLesson;
