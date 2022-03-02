const cypressTypeScriptPreprocessor = require("./cy-ts-preprocessor");
const registerCodeCoverageTasks = require("@cypress/code-coverage/task");

module.exports = (on, config) => {
  on("file:preprocessor", cypressTypeScriptPreprocessor);

  // enable code coverage collection
  return registerCodeCoverageTasks(on, config);
};
