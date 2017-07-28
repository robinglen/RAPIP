const client = {
  framework: require("./client"),
  performanceTestApi: require("./client/performanceTestApi")
};
const { performanceTestApi } = require("./server");

module.exports = {
  client,
  server: performanceTestApi
};
