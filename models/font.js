const mongoose = require('mongoose');

const FontSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  fontFamily: {
    type: String,
    required: true,
    unique: true,
  },
  userIds: {
    type: [String],
    required: true,
  },
});

const Font = mongoose.model('Font', FontSchema);

module.exports = Font;
