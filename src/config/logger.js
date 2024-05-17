const { createLogger, format, transports } = require('winston');
const colorizer = format.colorize();

const logger = createLogger({
  transports: [
    new transports.Console(),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: format.combine(
        format.json(),
        format.printf((msg) =>
          colorizer.colorize(
            msg.level,
            `${new Date().toUTCString()} - [${msg.level}] - ${typeof msg.message === 'string' ? msg.message : JSON.stringify(msg.message)}`,
          ),
        ),
      ),
      handleExceptions: true,
    }),

    new transports.File({
      filename: 'logs/combined.log',
      format: format.combine(
        format.json(),
        format.printf((msg) =>
          colorizer.colorize(
            msg.level,
            `${new Date().toUTCString()} - [${msg.level}] - ${typeof msg.message === 'string' ? msg.message : JSON.stringify(msg.message)}`,
          ),
        ),
      ),
      handleExceptions: true,
    }),
  ],
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.json(),
  ),
});

module.exports = { logger };
