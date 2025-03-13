const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

// Error converter middleware: Converts generic errors into custom ApiError
const errorConverter = (err, req, res, next) => {
  let error = err;

  // If the error is not an instance of ApiError, create a new ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

// Error handler middleware: Handles the formatted error and sends the response
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let {statusCode, message} = err;
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  // Store the error message to be accessed later (e.g., in logs)
  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && {stack: err.stack}),
  };

  if (config.env === 'development') {
    logger.error(err);
  }

  // Log the error stack trace if in development environment
  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
