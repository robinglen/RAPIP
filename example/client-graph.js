const { client } = require('../src');

// Example using the NET-A-PORTER product api
const NAP_PRODUCT_API =
  'https://api.net-a-porter.com/NAP/GB/en/10/0/summaries/expand?customListUrlKeys=whats-new-this-month';

// Example showing how you could collect performance metrics to work out average of API
async function runPerformanceTest() {
  const collectionOfPerformanceMetrics = [];

  for (let i = 0; i < 10; i++) {
    const cacheBuster = Math.random();
    collectionOfPerformanceMetrics.push(
      await client.performanceTestApi(
        `${NAP_PRODUCT_API}&cacheBuster=${cacheBuster}`
      )
    );
  }

  console.log(collectionOfPerformanceMetrics);
  process.exit(0);
}

client.framework.listen(3000, () => {
  console.log('Example app listening on port 3000!');
  runPerformanceTest();
});
