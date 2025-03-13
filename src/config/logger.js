const winston = require('winston');
const config = require('./config');

// Custom format for error logging
const enumerateErrorFormat = winston.format(info => {
   // If the log is an instance of Error, replace the message with the error stack trace
  if (info instanceof Error) {
    Object.assign(info, {message: info.stack});
  }
  return info;
});

// Create a logger instance using winston

const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    enumerateErrorFormat(),
    config.env === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(({level, message}) => `${level}: ${message}`)
  ),
  // Define where the logs will be written (console in this case)
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

module.exports = logger;
