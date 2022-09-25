const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/m_user');

exports.userSignup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const { email, password, name, role } = req.body;

  try {
    // finding user with same email
    const user = await User.findOne({ email: email });

    // if E-Mail address already exists!
    if (user) {
      if (user.role == 'admin') {
        const error = new Error(
          'You are already admin. Please login with your old credentials'
        );
        error.statusCode = 401;
        throw error;
      }

      const error = new Error('E-Mail address already exists! ');
      error.statusCode = 401;
      throw error;
    }

    // If no user found with same email
    const hashedpw = await bcrypt.hash(password, 12);

    const newUser = new User({
      email: email,
      password: hashedpw,
      name: name,
      role: role,
    });

    await newUser.save();

    res.status(201).json({ message: 'User created!' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.userLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  try {
    const fetchedUser = await User.findOne({ email: email });
    if (!fetchedUser) {
      const error = new Error('A user with this email could not be found.');
      error.statusCode = 401;
      throw error;
    }

    loadedUser = fetchedUser;
    const passwordMatched = await bcrypt.compare(
      password,
      fetchedUser.password
    );

    if (!passwordMatched) {
      const error = new Error('Wrong password!');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
        name: loadedUser.name,
        // password: password,
        role: 'user',
      },
      process.env.accessTokenSecret,
      { expiresIn: '24h' }
    );

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      .status(200)
      .json({
        token: token,
        userId: loadedUser._id.toString(),
        name: loadedUser.name,
        email: email,
        role: 'user',
      });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.userLogout = async (req, res, next) => {
  try {
    res.clearCookie('token');
    res.status(201).json({ message: 'User Logout Successfully', logout: true });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.adminSignup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const { email, password, name, role } = req.body;

  try {
    const fetchedUser = await User.findOne({ email: email });

    // if E-Mail address already exists!
    if (fetchedUser) {
      if (fetchedUser.role !== 'admin') {
        const error = new Error('E-Mail address already exists in user role! ');
        throw error;
      }

      const error = new Error('E-Mail address already exists in admin role! ');
      error.statusCode = 401;
      throw error;
    }

    // If no admin found with same email
    const hashedpw = await bcrypt.hash(password, 12);

    const newAdmin = new User({
      email: email,
      password: hashedpw,
      name: name,
      role: role,
    });

    await newAdmin.save();

    res.status(201).json({ message: 'Admin created!' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.adminLogin = async (req, res, next) => {
  const { email, password } = req.body;
  let loadedAdmin;

  try {
    const fetchedAdmin = await User.findOne({ email: email });
    if (!fetchedAdmin) {
      const error = new Error('A user with this email could not be found.');
      error.statusCode = 401;
      throw error;
    }

    if (fetchedAdmin.role == 'user') {
      const error = new Error("You don't have admin role");
      error.statusCode = 401;
      throw error;
    }

    loadedAdmin = fetchedAdmin;
    const passwordMatched = await bcrypt.compare(
      password,
      fetchedAdmin.password
    );

    if (!passwordMatched) {
      const error = new Error('Wrong password!');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: loadedAdmin.email,
        userId: loadedAdmin._id.toString(),
        name: loadedAdmin.name,
        // password: password,
        role: 'admin',
      },
      process.env.accessTokenSecret,
      { expiresIn: '24h' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })
    .status(200).json({
      token: token,
      userId: loadedAdmin._id.toString(),
      name: loadedAdmin.name,
      email: email,
      role: 'admin',
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// check Token from cookie
exports.checkAuth = async (req, res, next) => {
  let decodedToken;
  let role = false;
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(403).json({ message: 'Not authenticated', role, email: null, userId: null, name: null });

    decodedToken = jwt.verify(token, process.env.accessTokenSecret);

    console.log(decodedToken)
   
    role = decodedToken.role;

    res.status(200).json({ message: 'Authenticated Successfully', role, email: decodedToken.email, userId: decodedToken.userId, name: decodedToken.name });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 403;
    }
    next(err);
  }
};
