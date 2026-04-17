
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized, roles missing',
        error: process.env.NODE_ENV === 'development' ? null : undefined
      });
    }


    const hasRole = req.user.roles.some((role) => roles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `User role is not authorized to access this route. Required roles: ${roles.join(', ')}`,
        error: process.env.NODE_ENV === 'development' ? null : undefined
      });
    }

    next();
  };
};

module.exports = { authorize };
