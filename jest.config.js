// jest.config.js

const path = require('path');
const dotenv = require('dotenv');

// Load env.jest for testing environment
dotenv.config({ path: path.join(__dirname, 'env.jest') });

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/unit/**/*.test.js'],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testTimeout: 10000,
};
