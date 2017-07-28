# RAPIP
> REST API Performance. Test APIs from the perspective of both a Mobile phone and a Node server.

This module will help you analyse the performance of of any REST API, giving you to not just the response time but how long it will take to parse, filesize and any compression used.

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
* `api` - **Required.** String of the api you want to benchmark.
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
    filesize: {
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
* `api` - **Required.** String of the api you want to benchmark.
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
* `stringify` - How long in milliseconds it took to stringify the parsed the data (interesting for serializing data for universial apps).
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

If you want to the clientside performance framework you can use the command:

```Bash
  npm run example:client:framework
```
This will start a local instance of the framework which you can view in your browser with the url:

```Bash
  http://localhost:3000
```

You can then trigger a performance audit in the console but running the command:

```Javascript
performanceDemo()
```

This will console log the response of a demo request to: `https://httpbin.org/user-agent` with both Fetch and XHR.

## TODO
* make filesize and responsesize consistant, use dev tools network for naming
* Clean the code
* Add some tests
* Make the code isomorphic
* Move to use imports
* Add more than gZip compression
