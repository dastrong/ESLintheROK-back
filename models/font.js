const mongoose = require('mongoose');

const FontSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  fallback: {
    type: String,
    required: true,
  },
  userIds: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  ],
});

const Font = mongoose.model('Font', FontSchema);

module.exports = Font;
