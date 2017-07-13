const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
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
    const chrome = await launchChrome();
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

    await Page.navigate({ url: url });
    await Page.loadEventFired();

    const userAgent = await Runtime.evaluate({
      expression: 'navigator.userAgent'
    });
    performanceMetrics.emulation.userAgent = userAgent.result.value;

    const fetchPerformanceMetrics = await Runtime.evaluate({
      awaitPromise: true,
      expression: `performanceTestApiWithFetch("${api}")`
    });
    performanceMetrics.fetch = fetchPerformanceMetrics.result.value;
    // reset the page to make sure its clean each time
    await Page.navigate({ url: url });
    await Page.loadEventFired();

    const xhrPerformanceMetrics = await Runtime.evaluate({
      awaitPromise: true,
      expression: `performanceTestApiWithXHR("${api}")`
    });

    performanceMetrics.xhr = xhrPerformanceMetrics.result.value;

    chrome.kill();
    return { error: null, performanceMetrics: performanceMetrics };
  } catch (err) {
    return { error: null };
  }
}

module.exports = performanceTestApi;
