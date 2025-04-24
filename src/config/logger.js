const winston = require('winston');
const config = require('./config');

const enumerateErrorFormat = winston.format(info => {
  if (info instanceof Error) {
    Object.assign(info, {
      message: info.stack,
      type: 'error',
      ...(info.req && {
        request: {
          method: info.req.method,
          url: info.req.originalUrl,
          params: info.req.params,
          user: info.req.user?.id
        }
      })
    });
  }
  return info;
});

const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    enumerateErrorFormat(),
    config.env === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(({timestamp, level, message, ...meta}) => {
      return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

module.exports = logger;
