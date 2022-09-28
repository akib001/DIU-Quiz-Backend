const express = require('express');
const { body } = require('express-validator/check');

const quizController = require('../controllers/c_quiz');
const isAdmin = require('../middleware/is-admin');
const isUser = require('../middleware/is-user')

const router = express.Router();

// POST /quiz/create-quiz  -- CreateQuiz
router.post(
  '/create-quiz',
  isAdmin,
  quizController.createQuiz
);


// GET /quiz/quizzes
router.get('/fetch-quizzes', quizController.getQuizzes);

// GET /quiz/admin/quizzes
router.get('/admin/fetch-quizzes', isAdmin, quizController.getAdminQuizzes);

// GET /quiz/:quizId -- fetch single quiz
router.get('/singleQuiz/:quizId', quizController.getQuiz);

// GET /quiz/available-quizzes
router.get('/available-quizzes', isUser, quizController.getAvailableQuizzes);

// GET /quiz/available-single-quiz
router.get('/available-single-quiz/:quizId', isUser, quizController.getAvailableSingleQuiz);


// PUT /quiz/update/:quizId
router.put(
  '/update/:quizId',
  isAdmin,
  quizController.updateQuiz
);

// DELETE /quiz/delete/:quizId
router.delete('/delete/:quizId', isAdmin, quizController.deleteQuiz);

// POST /quiz/post-result
// router.post('/post-result', isUser, quizController.postResult);

// GET /quiz/fetch-results/user/:userId
router.get('/fetch-results/user/:userId', isUser, quizController.getResultsByUser);

// POST /quiz/fetch-results/quiz/:quizId
router.get('/fetch-results/quiz/:quizId', isAdmin, quizController.fetchResultsByQuiz);

// GET /quiz/fetch-user-result/:quizId
router.get('/fetch-user-result/:quizId', isUser, quizController.fetchUserResultByQuiz);

// POST /quiz/attempt-quiz
router.post('/attempt-quiz', isUser, quizController.attemptQuiz);

// POST /quiz/admin/statistics
router.get('/admin/statistics', isAdmin, quizController.getAdminStats);

module.exports = router;
