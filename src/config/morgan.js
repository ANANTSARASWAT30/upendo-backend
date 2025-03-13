const morgan = require('morgan');
const config = require('./config');
const logger = require('./logger');

// Define a custom token to capture error messages from the response object
morgan.token('message', (req, res) => res.locals.errorMessage || '');


// Function to get the appropriate IP format based on the environment (production or development)
const getIpFormat = () => (config.env === 'production' ? ':remote-addr - ' : '');

// Define the success log format with dynamic IP, HTTP method, URL, status code, and response time
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;

// Define the error log format with the same details as success, but also including the error message if available
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

const successHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: {write: message => logger.info(message.trim())},
});

const errorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: {write: message => logger.error(message.trim())},
});

module.exports = {
  successHandler,
  errorHandler,
};
