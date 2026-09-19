/** @type {import("jest").Config} */
module.exports = {
  setupFilesAfterEnv: ["./jest.setup.js"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  collectCoverage: true,
  collectCoverageFrom: ["app/assets/js/*.{js,ts}"],
  coverageDirectory: "coverage",
  resetMocks: false,
  testEnvironment: "jest-environment-jsdom",
  setupFiles: ["jest-localstorage-mock"],
  reporters: [
    "default",
    [
      "jest-junit",
      {
        suiteName: "jest tests",
        outputDirectory: "reports/jest",
        outputName: "js-test-results.xml",
        ancestorSeparator: " › ",
      },
    ],
  ],
};
