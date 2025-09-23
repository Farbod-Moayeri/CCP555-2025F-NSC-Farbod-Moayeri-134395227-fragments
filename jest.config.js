// jest.config.js

const path = require('path');
const dotenv = require('dotenv');

// Load env.jest instead of .env/debug.env
dotenv.config({ path: path.join(__dirname, 'env.jest') });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  testMatch: ['**/tests/unit/**/*.test.js'],
};

module.exports = config;
