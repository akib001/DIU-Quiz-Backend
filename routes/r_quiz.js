const express = require('express');
const { body } = require('express-validator/check');

const quizController = require('../controllers/c_quiz');
// const isAuth = require('../middleware/is-auth');

const router = express.Router();

// POST /quiz/create-quiz  -- CreateQuiz
router.post(
  '/create-quiz',
  // isAuth,
  quizController.createQuiz
);


// GET /feed/posts
// router.get('/posts', quizController.getPosts);


// // GET /feed/post/:postId -- fetch single post
// router.get('/post/:postId', quizController.getPost);


// // PUT /feed/post/:postId
// router.put(
//   '/post/:postId',
//   isAuth,
//   [
//     body('title')
//       .trim()
//       .isLength({ min: 5 }),
//     body('content')
//       .trim()
//       .isLength({ min: 5 })
//   ],
//   quizController.updatePost
// );

// router.delete('/post/:postId', isAuth, quizController.deletePost);

// // POST /feed/post-comment
// router.post('/post-comment', isAuth, quizController.postComment);

// router.post('/post/upvote', isAuth, quizController.upvotePost);

// router.post('/post/downvote', isAuth, quizController.downvotePost);

module.exports = router;
