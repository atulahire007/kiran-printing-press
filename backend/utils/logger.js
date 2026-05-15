const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory BEFORE setting up file transports
const logsDir = path.join(__dirname, '../logs');
try {
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
} catch (e) {
  // On read-only filesystems (some cloud platforms), just skip file logging
  console.warn('Warning: Cannot create logs directory. File logging disabled.');
}

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Build transports list - always include Console, add File only if logs dir exists
const transports = [
  new winston.transports.Console({
    format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFormat),
  }),
];

const exceptionHandlers = [
  new winston.transports.Console(),
];

// Only add file transports if we can write to the logs directory
if (fs.existsSync(logsDir)) {
  try {
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 5 * 1024 * 1024,
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5,
      })
    );
    exceptionHandlers.push(
      new winston.transports.File({ filename: path.join(logsDir, 'exceptions.log') })
    );
  } catch (e) {
    console.warn('Warning: File logging setup failed:', e.message);
  }
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports,
  exceptionHandlers,
});

module.exports = logger;
