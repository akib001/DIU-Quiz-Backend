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
  }, 
  answerScript: [
    {
      questionText: {
        type: String,
      },
      mark: {
        type: Number
      },
      answer1: {
        type: String,
        required: true
      },
      answer2: {
        type: String,
        required: true
      },
      answer3: {
        type: String,
        required: true
      },
      answer4: {
        type: String,
        required: true
      },
      correctAnswer: {
        type: String,
        required: true
      }, 
      userAnswer: {
        type: String,
        required: true
      }, 
      result: {
        type: Number,
        required: true
      }, 
      
    },
  ],
  duration: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Result', resultSchema);