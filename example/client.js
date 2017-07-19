const { client } = require('../src');

const API = 'https://httpbin.org/user-agent';

async function runPerformanceTest() {
  const results = await client.performanceTestApi(API);
  console.log(results);
  process.exit(0);
}

client.framework.listen(3000, () => {
  console.log('Listening on port 3000!');
  runPerformanceTest();
});
