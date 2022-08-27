const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    questions: [
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
        }
      },
    ],
    totalMark: {
      type: Number,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
