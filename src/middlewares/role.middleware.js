const { errorResponse } = require('../utils/responseHandler');

/**
 * Middleware to restrict access to specific roles
 * @param {Array} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return errorResponse(res, 'Not authorized, roles missing', 403);
    }

    // Check if user has at least one of the required roles
    const hasRole = req.user.roles.some((role) => roles.includes(role));

    if (!hasRole) {
      return errorResponse(
        res, 
        `User role is not authorized to access this route. Required roles: ${roles.join(', ')}`, 
        403
      );
    }

    next();
  };
};

module.exports = { authorize };
