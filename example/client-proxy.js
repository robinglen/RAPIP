const { client } = require('../src');

const proxy = 'http://localhost:3000/api';

async function runPerformanceTest() {
  const results = await client.performanceTestApi(proxy, {
    'x-rapip-api':
      'http://www.matchesfashion.com/mens/just-in/just-in-this-month?page=1&noOfRecordsPerPage=50&sort=&q=&format=json&navMode=notfull&noattraqt=Set'
  });
  console.log(results.response);
  process.exit(0);
}

client.framework.listen(3000, () => {
  console.log('Listening on port 3000!');
  runPerformanceTest();
});
