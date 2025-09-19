// src/logger.js
require('dotenv').config();
const pino = require('pino');

// Use `info` as our standard log level if not specified
const options = { level: process.env.LOG_LEVEL || 'info' };

// If we're doing `debug` logging, make the logs easier to read
if (options.level === 'debug') {
  // https://github.com/pinojs/pino-pretty
  options.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  };
}

const logger = pino(options);

if (options.level === 'debug') {
  logger.debug({ env: process.env }, 'Loaded environment variables');
}

// Create and export a Pino Logger instance:
// https://getpino.io/#/docs/api?id=logger
module.exports = logger;
