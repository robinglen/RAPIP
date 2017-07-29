const { client } = require("../src");

const proxy = "http://localhost:3000/api";
const API =
  "https://www.farfetch.com/uk/sets/men/new-in-this-week-eu-men.aspx?page=2&format=json";
const path = `${proxy}?path=${API}`;

async function runPerformanceTest() {
  const results = await client.performanceTestApi(path);
  console.log(results.response);
  process.exit(0);
}

client.framework.listen(3000, () => {
  console.log("Listening on port 3000!");
  runPerformanceTest();
});
