require("dotenv").config();

const outputPath = process.env.OUTPUT_TEST_RESULTS;

module.exports = {
  verbose: false,
  reporters: [
    "default",
    [
      "./node_modules/jest-html-reporter",
      {
        includeFailureMsg: true,
        includeConsoleLog: true,
        append: true,
        outputPath,
      },
    ],
  ],
};
