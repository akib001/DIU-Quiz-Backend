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
        answerOptions: [
          {
            answerText: {
              type: String,
            },
            isCorrect: {
              type: Boolean,
            },
          },
        ],
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

// postSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Quiz', quizSchema);
