const { validationResult } = require('express-validator/check');
const mongoose = require('mongoose');
const Quiz = require('../models/m_quiz');
const User = require('../models/m_user');
const Result = require('../models/m_result');

exports.getquizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find().populate({
      path: 'teacher',
      select: 'name',
    });
    res.status(200).json({
      message: 'Fetched quizzes successfully.',
      quiz: quizzes,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createQuiz = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }

  const { title, questions, totalMark, status, startTime, endTime, duration } =
    req.body;

  const quiz = new Quiz({
    title,
    questions,
    totalMark,
    status,
    startTime,
    endTime,
    duration,
    teacher: req.userId,
  });

  try {
    await quiz.save();

    res.status(201).json({
      message: 'Quiz created successfully!',
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getQuiz = async (req, res, next) => {
  const quizId = req.params.quizId;
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      const error = new Error('Could not find quiz.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: 'Quiz fetched.', quiz: quiz });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getAvailableQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find().populate({
      path: 'teacher',
      select: 'name',
    });

    const allResults = await Result.find();

    if (!allResults) {
      const error = new Error('Could not find any results');
      error.statusCode = 404;
      throw error;
    }

    let availableQuizzes = [];

    quizzes.map((item, index) => {
      if (!item.status) {
        return;
      }

      let duplicateAttempt;
      allResults.map((result, i) => {
        if (
          result.userId == req.userId &&
          result.quizId.toString() == item._id
        ) {
          duplicateAttempt = true;
        }
      });

      if (item.status && !duplicateAttempt) {
        availableQuizzes.push(item);
      }
    });

    res.status(200).json({
      message: 'Fetched quizzes successfully.',
      availableQuizzes,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.getAvailableSingleQuiz = async (req, res, next) => {
  const quizId = req.params.quizId;

  try {
    const quizzes = await Quiz.find().populate({
      path: 'teacher',
      select: 'name',
    });

    const allResults = await Result.find();

    if (!allResults) {
      const error = new Error('Could not find any results');
      error.statusCode = 404;
      throw error;
    }

    let availableQuizzes = [];

    quizzes.map((item, index) => {
      if (!item.status) {
        return;
      }

      let duplicateAttempt;
      allResults.map((result, i) => {
        if (
          result.userId == req.userId &&
          result.quizId.toString() == item._id
        ) {
          duplicateAttempt = true;
        }
      });

      if (item.status && !duplicateAttempt) {
        availableQuizzes.push(item);
      }
    });

    const availableSingleQuiz = availableQuizzes.filter((quiz) => quiz._id == quizId);

    res.status(200).json({
      message: 'Fetched quizzes successfully.',
      quiz: availableSingleQuiz,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateQuiz = async (req, res, next) => {
  const quizId = req.params.quizId;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }

  const { title, questions, totalMark, status, startTime, endTime, duration } =
    req.body;

  try {
    const fetchedQuiz = await Quiz.findById(quizId);

    if (!fetchedQuiz) {
      const error = new Error('Could not find the quiz.');
      error.statusCode = 404;
      throw error;
    }

    // checking quiz teacher
    if (fetchedQuiz.teacher.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }

    // checking quiz status.
    if (fetchedQuiz.status) {
      const error = new Error(
        'Quiz is already active. It can not be updated now'
      );
      error.statusCode = 403;
      throw error;
    }

    // updating the quiz
    fetchedQuiz.title = title;
    fetchedQuiz.questions = questions;
    fetchedQuiz.totalMark = totalMark;
    fetchedQuiz.startTime = startTime;
    fetchedQuiz.endTime = endTime;
    fetchedQuiz.duration = duration;
    fetchedQuiz.status = status;

    const saveUpdatedQuiz = await fetchedQuiz.save();

    res.status(200).json({ message: 'Quiz updated!', quiz: saveUpdatedQuiz });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteQuiz = async (req, res, next) => {
  const quizId = req.params.quizId;

  try {
    const fetchedQuiz = await Quiz.findById(quizId);

    if (!fetchedQuiz) {
      const error = new Error('Could not find the Quiz.');
      error.statusCode = 404;
      throw error;
    }

    // Checks author permission
    if (fetchedQuiz.teacher.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }
    const removedQuiz = await Quiz.findByIdAndRemove(quizId);

    const quizIdObj = mongoose.Types.ObjectId(quizId);
    // Deleting result
    // TODO: check this later
    const deletedResults = await Result.deleteMany({ quizId: quizIdObj });

    res.status(200).json({
      message: 'quiz and results deleted',
      removedQuiz: removedQuiz,
      removedResults: deletedResults,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.attemptQuiz = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }

  const { quizId, answers, duration } = req.body;

  const quizIdObj = mongoose.Types.ObjectId(quizId);

  try {
    // Check if same user is posting multiple result on same quiz

    const duplicateResult = await Result.findOne({
      userId: mongoose.Types.ObjectId(req.userId),
      quizId: quizIdObj,
    });

    if (duplicateResult) {
      const error = new Error('User already uploaded a result in this quiz');
      error.statusCode = 422;
      throw error;
    }

    const attemptedQuiz = await Quiz.findById(quizId);
    if (!attemptedQuiz) {
      const error = new Error(
        'Could not find the quiz. Or Teacher deleted the quiz'
      );
      error.statusCode = 404;
      throw error;
    }

    let resultAnswers = [];
    let obtainedMark = 0;

    attemptedQuiz?.questions.map((item, i) => {
      let userAnswer = answers[i].answer;
      let result = 0;
      if (item[item.correctAnswer] == userAnswer) {
        result = item.mark;
      }
      resultAnswers.push({
        questionText: item.questionText,
        answer1: item.answer1,
        answer2: item.answer2,
        answer3: item.answer3,
        answer4: item.answer4,
        mark: item.mark,
        correctAnswer: item.correctAnswer,
        result,
        userAnswer,
      });
      obtainedMark += result;
    });

    const resultObj = new Result({
      userId: req.userId,
      quizId: quizIdObj,
      obtainedMark: obtainedMark,
      answerScript: resultAnswers,
      duration,
      title: attemptedQuiz.title,
      totalMark: attemptedQuiz.totalMark
    });

    await resultObj.save();

    res.status(201).json({
      message: 'Result posted successfully!',
      results: resultObj,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getResultsByUser = async (req, res, next) => {
  try {
    const fetchResults = await Result.find({
      userId: mongoose.Types.ObjectId(req.userId)
    }).populate({
      path: 'quizId',
      populate: { path: 'teacher', select: 'name' }
    });

    res.status(200).json({
      message: 'Fetched results successfully.',
      results: fetchResults,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.fetchResultsByQuiz = async (req, res, next) => {
  const quizId = req.params.quizId;
  try {
    const fetchResults = await Result.find({
      quizId: mongoose.Types.ObjectId(quizId)
    }).populate({
      path: 'quizId',
      populate: { path: 'teacher', select: 'name' }
    });

    res.status(200).json({
      message: 'Fetched results successfully.',
      results: fetchResults,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.fetchUserResultByQuiz = async (req, res, next) => {
  const quizId = req.params.quizId;

  try {
    const fetchResults = await Result.find({
      quizId: mongoose.Types.ObjectId(quizId),
      userId: mongoose.Types.ObjectId(req.userId),
    });

    res.status(200).json({
      message: 'Fetched user results by quiz successfully.',
      results: fetchResults,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
