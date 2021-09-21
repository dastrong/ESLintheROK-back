const mongoose = require('mongoose');

const PastLessonSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    vocabulary: {
      type: [String],
    },
    expressions: {
      type: [String],
    },
    title: {
      type: String,
    },
    expires: {
      type: Date,
      default: () => Date.now() + 1000 * 60 * 60 * 24 * 182, // expires half year from creation
    },
    shortId: {
      type: String,
    },
  },
  { timestamps: true }
);

const PastLesson = mongoose.model('PastLesson', PastLessonSchema);

module.exports = PastLesson;
