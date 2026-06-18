const winston = require('winston');
require('winston-daily-rotate-file');
require('dotenv').config();

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const isDevelopment = process.env.NODE_ENV === 'development';

const fileTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/%YYYY%/%MM%/%DD%.json',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: winston.format.combine(
    enumerateErrorFormat(),
    isDevelopment ? winston.format.colorize() : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(({ level, message }) => `${level}: ${message}`)
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
    fileTransport
  ],
});

module.exports = logger;