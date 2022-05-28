module.exports = {
  // Add this line to your Jest config
  setupFilesAfterEnv: ['./jest.setup.js'],
  collectCoverage: true,
  collectCoverageFrom: ['app/assets/js/*.{js,ts}'],
  coverageDirectory: 'coverage',
  resetMocks: false,
  testEnvironment: "jest-environment-jsdom",
  setupFiles: [
    "jest-localstorage-mock",
  ],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        suiteName: 'jest tests',
        outputDirectory: 'reports/jest',
        outputName: 'js-test-results.xml',
        ancestorSeparator: ' › ',
      },
    ],
  ],
}
