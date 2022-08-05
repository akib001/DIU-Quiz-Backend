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
router.get('/fetch-quizzes', quizController.getquizzes);


// GET /quiz/:quizId -- fetch single quiz
router.get('/singleQuiz/:quizId', quizController.getQuiz);


// PUT /quiz/update/:quizId
router.put(
  '/update/:quizId',
  isAdmin,
  quizController.updateQuiz
);

// DELETE /quiz/delete/:quizId
router.delete('/delete/:quizId', isAdmin, quizController.deleteQuiz);

// POST /quiz/post-result
router.post('/post-result', isUser, quizController.postResult);

// GET /quiz/fetch-results/userId
router.get('/fetch-results/userId', isUser, quizController.getResultsByUser);

// POST /quiz/fetch-results/quizId
router.post('/fetch-results/quizId', isAdmin, quizController.fetchResultsByQuiz);

// POST /quiz/fetch-user-result/quizId
router.post('/fetch-user-result/quizId', isUser, quizController.fetchUserResultByQuiz);

module.exports = router;
