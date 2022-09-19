const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.accessTokenSecret);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }

  if (decodedToken.role !== 'user') {
    const error = new Error("Don't have user previlage");
    error.statusCode = 401;
    throw error;
  }

  req.userId = decodedToken.userId;
  next();
};
