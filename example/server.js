const { server } = require('../src');

// Example using the NET-A-PORTER product api
const NAP_PRODUCT_API =
  'https://api.net-a-porter.com/NAP/GB/en/10/0/summaries/expand?customListUrlKeys=whats-new-this-month';

async function getPerformanceMetrics() {
  const results = await server(`${NAP_PRODUCT_API}`);
  console.log(results);
  process.exit(0);
}

getPerformanceMetrics();
