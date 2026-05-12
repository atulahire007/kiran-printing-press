const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const ErrorResponse = require('../utils/ErrorResponse');

// ══════════════════════════════════════════
// AUTH MIDDLEWARE
// ══════════════════════════════════════════

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse('Not authenticated. Please log in.', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return next(new ErrorResponse('User not found', 401));
    if (user.isBlocked) return next(new ErrorResponse('Your account has been blocked.', 403));

    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorResponse('Invalid or expired token', 401));
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`Role '${req.user.role}' is not authorized for this action`, 403));
    }
    next();
  };
};

exports.optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) token = req.headers.authorization.split(' ')[1];
  else if (req.cookies?.token) token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch { /* silent fail */ }
  }
  next();
};
