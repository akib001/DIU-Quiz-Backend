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
  console.log(quizId);
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

    res.status(200).json({ message: 'quiz and results deleted', removedQuiz: removedQuiz, removedResults: deletedResults });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.postResult = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }

  const quizId = req.body.quizId;
  const obtainedMark = req.body.obtainedMark;

  const quizIdObj = mongoose.Types.ObjectId(quizId);

  try {
    // Check if same user is posting multiple result on same quiz

    const duplicateResult = await Result.findOne({ userId: mongoose.Types.ObjectId(req.userId), quizId: quizIdObj})

    if(duplicateResult) {
      const error = new Error('User already uploaded a result in this quiz');
      error.statusCode = 422;
      throw error;
    }

    const result = new Result({
      userId: req.userId,
      quizId: quizIdObj,
      obtainedMark: obtainedMark
    });

    await result.save();

    res.status(201).json({
      message: 'Result posted successfully!',
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
    const fetchResults = await Result.find({ userId: mongoose.Types.ObjectId(req.userId) })

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
  const quizId = req.body.quizId;

  try {
    const fetchResults = await Result.find({ quizId: mongoose.Types.ObjectId(quizId) })

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
  const quizId = req.body.quizId;

  try {
    const fetchResults = await Result.find({ quizId: mongoose.Types.ObjectId(quizId), userId: mongoose.Types.ObjectId(req.userId) })

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





