const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
const request = require('request-promise');
const zlib = require('zlib');
const { promisify } = require('util');
// taken from lighthouse
// https://github.com/GoogleChrome/lighthouse/blob/63b4ac14d0a871ade0630db2885edd7848843243/lighthouse-core/lib/emulation.js
const emulation = require('./emulation');

function launchChrome(headless) {
  return chromeLauncher.launch({
    chromeFlags: ['--disable-gpu', headless ? '--headless' : '']
  });
}

async function performanceTestApi(
  api,
  headers,
  emulator = {
    cpuThrottling: true,
    networkThrottling: true
  },
  headless = true,
  url = 'http://localhost:3000'
) {
  let performanceMetrics = {};
  // configure throttling
  emulator.cpu = emulator.cpuThrottling
    ? emulation.settings.CPU_THROTTLE_METRICS
    : emulation.settings.NO_CPU_THROTTLE_METRICS;
  emulator.network = emulator.networkThrottling
    ? emulation.settings.TYPICAL_MOBILE_THROTTLING_METRICS
    : emulation.settings.NO_THROTTLING_METRICS;
  try {
    const { client, chrome } = await _configureChrome(headless, url, emulator);
    const { Runtime } = client;

    performanceMetrics.emulation = emulation.getEmulationDesc();
    performanceMetrics.emulation.userAgent =
      emulation.settings.NEXUS5X_USERAGENT.userAgent;

    // Client will not let us by default get some specific headers
    // so we are going around it we call the api from the server before mobile perf testing
    const serverHeaders = await getServersideHeaders(api, headers);

    // check if its worked
    if (serverHeaders.error) {
      chrome.kill();
      return {
        error: serverHeaders.error
      };
    } else {
      performanceMetrics.api = serverHeaders.api;
      performanceMetrics.gzipEnabled = serverHeaders.gzipEnabled;
      performanceMetrics.size = serverHeaders.size;

      // setting params for api calls
      // Im sorry for this code
      let params = `"${api}"`;
      if (headers && headers['x-rapip-api']) {
        let headerString = JSON.stringify(headers);
        if (headers['x-rapip-api']) {
          headerString = `{'x-rapip-api': '${headers['x-rapip-api']}'}`;
          if (headers['x-rapip-headers']) {
            const string = JSON.stringify(headers['x-rapip-headers']);
            headerString = `{'x-rapip-api': '${headers[
              'x-rapip-api'
            ]}', 'x-rapip-headers': '${string}'}`;
          }
        }
        params = `"${api}", ${headerString}`;
      }

      const fetchPerformanceMetrics = await Runtime.evaluate({
        awaitPromise: true,
        expression: `performanceTestApiWithFetch(${params})`
      });

      if (fetchPerformanceMetrics.result.value) {
        performanceMetrics.fetch = JSON.parse(
          fetchPerformanceMetrics.result.value
        );
      } else {
        performanceMetrics.fetch = 'error';
      }

      // We need to kill chrome each time because for some reason
      // which ever call (Fetch or XHR) the first one is slower
      // even if I reload page, new tab and clear caches
      // Averages don't fix either, chrome must be doing something smart
      chrome.kill();
      // this is a bit gross
      const chromeObj = await _configureChrome(headless, url, emulator);
      const runtime2 = chromeObj.client.Runtime;
      const chrome2 = chromeObj.chrome;

      const xhrPerformanceMetrics = await runtime2.evaluate({
        awaitPromise: true,
        expression: `performanceTestApiWithXHR(${params})`
      });

      if (xhrPerformanceMetrics.result.value) {
        performanceMetrics.xhr = JSON.parse(xhrPerformanceMetrics.result.value);
      } else {
        performanceMetrics.xhr = 'error';
      }

      chrome2.kill();
      return {
        response: performanceMetrics
      };
    }
  } catch (error) {
    return { error: error };
  }
}

async function getServersideHeaders(url, headers = {}) {
  let headersObj = headers;
  headersObj['user-agent'] = emulation.settings.NEXUS5X_USERAGENT;
  let api = url;
  if (headers['x-rapip-api']) {
    api = headers['x-rapip-api'];
  }
  if (headers['x-rapip-headers']) {
    headersObj = headers['x-rapip-headers'];
  }

  try {
    const response = await request({
      uri: api,
      headers: headersObj,
      resolveWithFullResponse: true,
      gzip: true
    });

    const contentEncoding = response.headers['content-encoding'];
    const rapipProxyEnabled = false;
    const rapipProxyOverhead = 0;

    // add support for Accept-Encoding: "gzip, deflate, sdch, br", - in the future
    const gzipEnabled = contentEncoding === 'gzip' ? true : false;
    let size = {
      raw: 0,
      'content-length': true
    };
    // get content length
    if (response.headers['content-length']) {
      size.raw = (response.headers['content-length'] / 1024).toFixed(2);
      size['content-length'] = true;
    } else {
      if (gzipEnabled) {
        const gzipAsync = promisify(zlib.gzip);
        let gzip = await gzipAsync(response.body);
        size.raw = (gzip.byteLength / 1024).toFixed(2);
        size['content-length'] = false;
      } else {
        size.raw = (Buffer.byteLength(response.body) / 1024).toFixed(2);
        size['content-length'] = false;
      }
    }

    return {
      api: api,
      gzipEnabled: gzipEnabled,
      size: {
        raw: Number(size.raw),
        message: `${size.raw}kb`,
        'content-length': size['content-length']
      }
    };
  } catch (error) {
    return {
      error: error
    };
  }
}

async function _configureChrome(headless, url, emulator) {
  const chrome = await launchChrome(headless);
  const client = await CDP({ port: chrome.port });
  const { Network, Emulation, Page, Runtime } = client;

  // logging requests
  Network.requestWillBeSent(params => {
    // is this needed? maybe as an event?
    console.log(`Request: ${params.request.url}`);
  });

  // make sure the session doesn't cache
  await Network.setCacheDisabled({ cacheDisabled: true });

  // set emulation
  await Emulation.setCPUThrottlingRate(emulator.cpu);
  await Emulation.setDeviceMetricsOverride(
    emulation.settings.NEXUS5X_EMULATION_METRICS
  );

  // configure network
  await Network.setUserAgentOverride(emulation.settings.NEXUS5X_USERAGENT);
  await Network.emulateNetworkConditions(emulator.network);

  await Network.enable();
  await Page.enable();

  await Page.navigate({ url: url });
  await Page.loadEventFired();

  return { client, chrome };
}

module.exports = performanceTestApi;
