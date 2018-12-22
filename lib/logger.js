const { createLogger, format, transports } = require('winston');

const { combine, timestamp, printf } = format;

const myFormat = printf(info => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`);

/** Log configuration */
exports.logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), myFormat),
  transports: [
    new transports.Console({
      timestamp: true,
    }),
  ],
});
