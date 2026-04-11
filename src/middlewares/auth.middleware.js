const jwt = require('jsonwebtoken');

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
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
      error: process.env.NODE_ENV === 'development' ? null : undefined
    });
  }
};

module.exports = { protect };
