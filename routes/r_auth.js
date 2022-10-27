const express = require('express');
const {body} = require('express-validator/check');
const isAdmin = require('../middleware/is-admin');
const isUser = require('../middleware/is-user')
const passport = require('passport');

const authController = require('../controllers/c_auth');

const router = express.Router();

const clientUrl = process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL_PROD : process.env.CLIENT_URL_DEV;

const signupValidation = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .normalizeEmail(),
    body('password').trim().isLength({min: 5}).withMessage('Please enter a strong password.'),
    body('name').isLength({min: 3, max: 50}).withMessage('Please enter your valid name').trim().not().isEmpty(),
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

// GET => User Logout
router.get('/user/logout', authController.userLogout);

// Put => Admin signup
router.put('/admin/signup', signupValidation, authController.adminSignup);

// Post => Admin Login
router.post('/admin/login', authController.adminLogin);

// GET => auth/check-auth
router.get('/check-auth', authController.checkAuth)

router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    }),
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/',
        session: false,
    }),
    (req, res) => {
        const token = req.user.generateJWT();
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        })
        res.redirect(clientUrl);
    },
);

module.exports = router;
