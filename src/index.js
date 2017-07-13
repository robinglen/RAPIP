const client = {
  framework: require('./client'),
  performanceTestApi: require('./client/performanceTestApi')
};
const server = require('./server');

module.exports = {
  client,
  server
};
