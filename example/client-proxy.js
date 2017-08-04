const { client } = require('../src');

const proxy = 'http://localhost:3000/api';

// flat test - works
// async function runPerformanceTest() {
//   const results = await client.performanceTestApi(
//     'https://httpbin.org/user-agent'
//   );
//   console.log(results);
//   process.exit(0);
// }

// flat with headers
async function runPerformanceTest() {
  const results = await client.performanceTestApi(
    'https://ecomm.ynap.biz/os/os1/search/resources/store/Moncler_GB/productview/byCategory/3074457345616678867?pageSize=50&pageNumber=4',
    {
      'X-IBM-Client-Id': 'dea579ee-1cb3-43ad-9775-b2015636d560'
    }
  );
  console.log(results);
  process.exit(0);
}

// test with simple proxy - works
// async function runPerformanceTest() {
//   const results = await client.performanceTestApi(proxy, {
//     'x-rapip-api':
//       'http://www.matchesfashion.com/mens/just-in/just-in-this-month?page=1&noOfRecordsPerPage=60&sort=&q=&format=json&navMode=notfull&noattraqt=Set'
//   });
//   console.log(results.response);
//   process.exit(0);
// }

// async function runPerformanceTest() {
//   const results = await client.performanceTestApi(proxy, {
//     'x-rapip-api':
//       'https://ecomm.ynap.biz/os/os1/search/resources/store/Moncler_GB/productview/byCategory/3074457345616678867?pageSize=50&pageNumber=1&',
//     'x-rapip-headers': {
//       'X-IBM-Client-Id': 'dea579ee-1cb3-43ad-9775-b2015636d560'
//     }
//   });
//   console.log(results.response);
//   process.exit(0);
// }

// async function runPerformanceTest() {
//   const results = await client.performanceTestApi(proxy, {
//     'x-rapip-api':
//       'http://www.matchesfashion.com/mens/just-in/just-in-this-month?page=1&noOfRecordsPerPage=60&sort=&q=&format=json&navMode=notfull&noattraqt=Set'
//   });
//   console.log(results.response);
//   process.exit(0);
// }

client.framework.listen(3000, () => {
  console.log('Listening on port 3000!');
  runPerformanceTest();
});

// LAD
// api: 'https://api.net-a-porter.com/NAP/GB/en/50/0/summaries/expand?visibility=any-visible&customListUrlKeys=whats-new-this-month',
// gzipEnabled: true,
// size: { raw: 3.61, message: '3.61kb' },
//
// POLYJUICE
//   api: 'http://ynap-polyjuice.eu-west-1.elasticbeanstalk.com/search/resources/store/NAP_GB/productview/byCategory?category=Clothing',
// gzipEnabled: false,
// size: { raw: 232.84, message: '232.84kb' },

// Matches
//   api: 'http://www.matchesfashion.com/mens/just-in/just-in-this-month?page=1&noOfRecordsPerPage=60&sort=&q=&format=json&navMode=notfull&noattraqt=Set',
// gzipEnabled: true,
// size: { raw: 32.31, message: '32.31kb' },

// FARFETCH
//   api: 'https://www.farfetch.com/uk/sets/men/new-in-this-week-eu-men.aspx?page=2&format=json',
// gzipEnabled: true,
// size: { raw: 25.73, message: '25.73kb' },

// ASOS
//   api: 'http://searchapi.asos.com/product/search/v1/categories/4210?currency=GBP&store=1&lang=en&rowlength=3&channel=desktop-web&offset=36&limit=36',
// gzipEnabled: true,
// size: { raw: 5.79, message: '5.79kb' },
//

// MONCLER
//
//
