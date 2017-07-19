const { server } = require('../src');

const API = 'https://httpbin.org/user-agent';

async function getPerformanceMetrics() {
  const results = await server(`${API}`);
  console.log(results);
  process.exit(0);
}

getPerformanceMetrics();
