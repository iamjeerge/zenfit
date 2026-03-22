module.exports = {
  testEnvironment: 'detox',
  testRunner: 'jest-circus',
  testTimeout: 120000,
  testRegex: '\\.e2e\\.js$',
  reporters: ['detox/runners/jest/streamlineReporter'],
  verbose: true,
};
