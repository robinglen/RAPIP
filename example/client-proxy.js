const { client } = require('../src');

const PROXY = 'https://localhost:3000/api';
const API = 'https://httpbin.org/user-agent';
const HEADERS = {
  'x-rapip-api': API
}

async function runPerformanceTest() {
  const results = await client.performanceTestApi(PROXY, HEADERS);
  console.log(results.response.fetch);
  process.exit(0);
}

client.framework.listen(3000, () => {
  console.log('Listening on port 3000!');
  runPerformanceTest();
});
