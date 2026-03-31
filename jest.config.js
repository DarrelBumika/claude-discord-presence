module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testPathIgnorePatterns: ['/node_modules/', '/.worktrees/'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['lib/**/*.js', 'index.js']
};
