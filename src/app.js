const cors = require('cors');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const httpStatus = require('http-status');
const routes = require('./routes/v1');
const morgan = require('./config/morgan');
const config = require('./config/config');
const ApiError = require('./utils/ApiError');
const { errorConverter, errorHandler } = require('./middlewares/error');

const app = express();

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running'
  });
});

// Logging middleware (only for non-test environments)
if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// Set security HTTP headers
app.use(helmet());

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// Enable gzip compression
app.use(compression());

// Enable CORS
app.use(cors());
app.options('*', cors());

// Reroute all API requests starting with "/api/v1"
app.use('/api/v1', routes);

// Handle unknown API requests (404)
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// Convert errors to ApiError
app.use(errorConverter);

// Global error handler
app.use(errorHandler);

module.exports = app;  // ✅ Export app once (Don't duplicate!)
