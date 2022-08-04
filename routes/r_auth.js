const express = require('express');
const { body } = require('express-validator/check');

const User = require('../models/m_user');
const authController = require('../controllers/c_auth');

const router = express.Router();

const signupValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .normalizeEmail(),
  body('password').trim().isLength({ min: 5 }).withMessage('Please enter a strong password.'),
  body('name').isLength({ min: 3, max: 50 }).withMessage('Please enter your valid name').trim().not().isEmpty(),
]

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .normalizeEmail(),
  body('password').trim()
]

// Put => User signup
router.put('/user/signup', signupValidation, authController.userSignup);

// Post => User Login
router.post('/user/login', authController.userLogin);

// Put => Admin signup
router.put('/admin/signup', signupValidation, authController.adminSignup);

// Post => Admin Login
router.post('/admin/login', authController.adminLogin);

module.exports = router;
