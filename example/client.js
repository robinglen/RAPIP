const { client } = require('../src');

// Example using the NET-A-PORTER product api
const NAP_PRODUCT_API =
  'https://api.net-a-porter.com/NAP/GB/en/10/0/summaries/expand?customListUrlKeys=whats-new-this-month';

async function runPerformanceTest() {
  const results = await client.performanceTestApi(NAP_PRODUCT_API);
  console.log(results);
  process.exit(0);
}

client.framework.listen(3000, () => {
  console.log('Example app listening on port 3000!');
  runPerformanceTest();
});
