module.exports = {
    preset: 'jest-puppeteer',
    testMatch: ['**/tests/**/*.test.js'],
    maxConcurrency: 1,
    maxWorkers: 1,
    testTimeout: 20000
  };
  