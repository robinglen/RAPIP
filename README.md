# RAPIP
> [ra-peep] REST API Performance. Test APIs from the perspective of both a Mobile phone and a Node server.

This module will help you collect performance metrics of any REST API, giving you to not just the response time but how long it will take to parse, size and any compression used (currently only supporting gzip).

_RAPIP uses Async/Await so needs Node 8 and Chrome 55_

## Set up

```Bash
npm install --save RAPIP
```

## Usage

```Javascript
const { server, client } = require('rapip');
```

### Reference

#### `client(api, headers, emulator, headless, url)`
Start a mobile client performance audit, it uses the Lighthouse Nexus 5 emulator (https://github.com/GoogleChrome/lighthouse/blob/63b4ac14d0a871ade0630db2885edd7848843243/lighthouse-core/lib/emulation.js).

You will get results for both an XHR and Fetch request.

##### Parameters
* `api` - **Required.** String url of the api you want to benchmark.
* `headers` - Object of request headers you want to add to the api call.
* `emulation` - Object for the emulation configuration.
  * `cpuThrottling` - Boolean for toggling CPU throttling _(Default: true)_.
  * `networkThrottling` - Boolean for toggling Network throttling _(Default: true)_.
* `headless` - Boolean for toggling Chrome headless _(Default: true)_.
* `url` - String for the URL to run the framework _(Default: "http://localhost:3000")_.

##### Response
```Javascript
{
  response: {
    api: 'https://httpbin.org/user-agent'
    emulation: {
      deviceEmulation: 'Nexus 5X',
      cpuThrottling: '4x slowdown',
      networkThrottling: '562.5ms RTT, 1.4Mbps down, 0.7Mbps up',
      userAgent: 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5 Build/MRA58N) AppleWebKit/537.36(KHTML, like Gecko) Chrome/61.0.3116.0 Mobile Safari/537.36'
    },
    gzipEnabled: false,
    size: {
      raw: 0.08,
      message: '0.08kb'
    },
    fetch: {
      name: 'Fetch',
      request: { raw: 448, message: '448ms' },
      parse: { raw: 4, message: '4ms' }
    },
    xhr: {
      name: 'XHR',
      request: { raw: 135, message: '135ms' },
      parse: { raw: 0, message: '0ms' }
    }
  }
}
```
* `api` - api called.
* `emulation` - Metadata about the emulator the test was run on.
* `gzipEnabled` - If the code is encoded.
* `fetch` - Request and parse metrics for a fetch request.
* `xhr` - Request and parse metrics for a xhr request.

#### `server(api, headers)`
Start a server performance audit.

##### Parameters
* `api` - **Required.** String url of the api you want to benchmark.
* `headers` - Object of request headers you want to add to the api call.

##### Response
```Javascript
{ response: {
    request: { raw: '462', message: '462ms' },
    parse: { raw: '1', message: '1ms' },
    responseSize: { raw: '0.08', message: '0.08kb' },
    stringify: { raw: '8', message: '8ms' },
    gzipEnabled: false,
    api: 'https://httpbin.org/user-agent'
  }
}
```
* `request` - How long in milliseconds the fetch request took.
* `parse` - How long in milliseconds it took to parse the data.
* `responseSize` - How large the response was in Kilobytes.
* `stringify` - How long in milliseconds it took to stringify the parsed the data (can be interesting for serializing data for universial apps).
* `gzipEnabled` - If the code is encoded.
* `api` - api called.

### Examples

You can configure both server and clientside runners.

#### Clientside

Performance test API from a mobile device.

```Javascript
const { client } = require('rapip');

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

```

You can try this example with the command:

```Bash
  npm run example:client
```

#### Server

Performance test API on the server side.

```Javascript
const { server } = require('rapip');

const API = 'https://httpbin.org/user-agent';

async function getPerformanceMetrics() {
  const results = await server(`${API}`);
  console.log(results);
  process.exit(0);
}

getPerformanceMetrics();

```

You can try this example with the command:

```Bash
  npm run example:server
```

#### Clientside framework

If you want to use the clientside performance framework you can use the command:

```Bash
  npm start
```

##### Performance benchmarking

This will start a local instance of the framework which you can view in your browser with the url:

```Bash
  http://localhost:3000
```

You can then trigger a performance audit in the console but running the command:

```Javascript
performanceDemo()
```

This will console log the response of a demo request to: `https://httpbin.org/user-agent` with both Fetch and XHR.

If you want to try your own API call within the framework you can use either `performanceTestApiWithFetch()` or `performanceTestApiWithXHR()`. Both use the same interface:

```Javascript
performanceTestApiWithFetch(api, headers);
performanceTestApiWithXHR(api, headers);
```

* `api` - **Required.** String url of the api you want to benchmark.
* `headers` - Object of request headers you want to add to the api call.

##### Proxying API calls.

If you are performance testing an API from the perspective of a mobile phone you are constrained by the browser sandbox. If the API doesn't include CORS headers you will not be able to call it from your tests.

However to help this the client framework provides a (hopefully) transparent proxy. You can use it in the following way:

```Javascript
const { client } = require('rapip');

const PROXY = 'https://localhost:3000/api';
const API = 'https://httpbin.org/user-agent';
const HEADERS = {
  'x-rapip-api': API
}

async function runPerformanceTest() {
  const results = await client.performanceTestApi(PROXY, HEADERS);
  console.log(results);
  process.exit(0);
}

client.framework.listen(3000, () => {
  console.log('Listening on port 3000!');
  runPerformanceTest();
});
```

The call will now goto the proxy service and use the


performanceTestApiWithFetch('http://localhost:3000/api', {'x-rapip-api': 'https://ecomm.ynap.biz/os/os1/search/resources/store/Moncler_GB/productview/byCategory/3074457345616678867?pageSize=50&pageNumber=1', 'x-rapip-headers' : '{"X-IBM-Client-Id":"dea579ee-1cb3-43ad-9775-b2015636d560"}'})



## Bugs

* Test all of the gzip work and add back in if needs be compressed

Test in client:


## TODO
* add build and deploy steps
* Clean the code
* Add some tests
* Make the code isomorphic
* Move to use imports
* Add more than gZip compression
