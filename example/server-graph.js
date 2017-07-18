const { server } = require('../src');

// Example using the NET-A-PORTER product api
const NAP_PRODUCT_API =
  'https://api.net-a-porter.com/NAP/GB/en/10/0/summaries/expand?customListUrlKeys=whats-new-this-month';

// Example showing how you could collect performance metrics to work out average of API
async function getPerformanceMetrics() {
  const collectionOfPerformanceMetrics = [];

  for (let i = 0; i < 10; i++) {
    const cacheBuster = Math.random();
    collectionOfPerformanceMetrics.push(
      await server(`${NAP_PRODUCT_API}&cacheBuster=${cacheBuster}`)
    );
  }

  console.log(collectionOfPerformanceMetrics);
  process.exit(0);
}

getPerformanceMetrics();
