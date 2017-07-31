const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
const request = require('request-promise');
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
  let performanceMetrics = {
    api: api
  };
  // configure throttling
  emulator.cpu = emulator.cpuThrottling
    ? emulation.settings.CPU_THROTTLE_METRICS
    : emulation.settings.NO_CPU_THROTTLE_METRICS;
  emulator.network = emulator.networkThrottling
    ? emulation.settings.TYPICAL_MOBILE_THROTTLING_METRICS
    : emulation.settings.NO_THROTTLING_METRICS;
  try {
    const chrome = await launchChrome(headless);
    const client = await CDP({ port: chrome.port });
    const { Network, Emulation, Page, Runtime } = client;

    performanceMetrics.emulation = emulation.getEmulationDesc();

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

    // Client will not let us by default get some specific headers
    // so we are going around it we call tha pi from the server before mobile perf testing
    const serverHeaders = await getServersideHeaders(api, headers);
    performanceMetrics.gzipEnabled = serverHeaders.gzipEnabled;
    performanceMetrics.size = serverHeaders.size;

    await Page.navigate({ url: url });
    await Page.loadEventFired();

    const userAgent = await Runtime.evaluate({
      expression: 'navigator.userAgent'
    });
    performanceMetrics.emulation.userAgent = userAgent.result.value;

    // setting params for api calls
    let params = `"${api}"`;
    if (headers) {
      params = `"${api}", ${headers}`;
    }

    const fetchPerformanceMetrics = await Runtime.evaluate({
      awaitPromise: true,
      expression: `performanceTestApiWithFetch(${params})`
    });

    performanceMetrics.fetch = JSON.parse(fetchPerformanceMetrics.result.value);

    // reset the page to make sure its clean each time
    await Page.navigate({ url: url });
    await Page.loadEventFired();

    const xhrPerformanceMetrics = await Runtime.evaluate({
      awaitPromise: true,
      expression: `performanceTestApiWithXHR(${params})`
    });

    performanceMetrics.xhr = JSON.parse(xhrPerformanceMetrics.result.value);

    chrome.kill();
    return {
      response: performanceMetrics
    };
  } catch (error) {
    return { error: error };
  }
}

async function getServersideHeaders(url, headers) {
  try {
    const response = await request({
      uri: url,
      headers: headers,
      resolveWithFullResponse: true
    });
    const contentEncoding = response.headers['content-encoding'];
    const rapipProxyEnabled = false;
    const rapipProxyOverhead = 0;

    // add support for Accept-Encoding: "gzip, deflate, sdch, br", - in the future
    const gzipEnabled = contentEncoding === 'gzip' ? true : false;
    const size = (response.headers['content-length'] / 1024).toFixed(2);
    return {
      gzipEnabled: gzipEnabled,
      size: {
        raw: Number(size),
        message: `${size}kb`
      }
    };
  } catch (error) {
    return {
      gzipEnabled: 'failed',
      size: 'failed'
    };
  }
}

module.exports = performanceTestApi;
