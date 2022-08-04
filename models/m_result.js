const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resultSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quizId: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  obtainedMark: {
    type: Number,
    required: true,
  }
});

module.exports = mongoose.model('Result', resultSchema);
