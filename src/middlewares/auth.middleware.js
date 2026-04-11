const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseHandler');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Add user from payload to request
      req.user = decoded;
      
      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      return errorResponse(res, 'Not authorized, token failed', 401, error);
    }
  }

  if (!token) {
    return errorResponse(res, 'Not authorized, no token', 401);
  }
};

module.exports = { protect };
