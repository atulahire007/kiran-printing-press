// middlewares/notFound.js
const ErrorResponse = require('../utils/ErrorResponse');

exports.notFound = (req, res, next) => {
  next(new ErrorResponse(`Route not found: ${req.originalUrl}`, 404));
};
