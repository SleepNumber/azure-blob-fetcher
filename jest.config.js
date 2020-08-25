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
      },
    ],
  ],
};
