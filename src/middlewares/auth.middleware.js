const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {

      token = req.headers.authorization.split(' ')[1];


      const decoded = jwt.verify(token, process.env.JWT_SECRET);


      req.user = decoded;

      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);


      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          code: 'TOKEN_EXPIRED',
          message: 'Your session has expired. Please log in again to continue.'
        });
      }


      return res.status(401).json({
        code: 'INVALID_TOKEN',
        message: 'Invalid session. Please log in again.'
      });
    }
  }


  if (!token) {
    return res.status(401).json({
      code: 'NO_TOKEN',
      message: 'Access denied. No authentication token provided.'
    });
  }
};

module.exports = { protect };
