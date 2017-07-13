const fetch = require('node-fetch');

async function fetchData(url) {
  try {
    const time = process.hrtime();
    const response = await fetch(url);
    const diff = process.hrtime(time);
    const ms = convertNanToMilliSeconds(diff);
    const responseSize = response.headers.get('Content-Length') / 1024;
    return {
      data: response,
      timings: ms,
      responseSize: responseSize.toFixed(0)
    };
  } catch (error) {
    console.log(error);
  }
}

function convertNanToMilliSeconds(hrTimer) {
  const nanoSeconds = hrTimer[1];
  const microSeconds = nanoSeconds / 1e3;
  const milliSeconds = microSeconds / 1e3;
  return milliSeconds.toFixed(0);
}

async function parseJson(response) {
  const time = process.hrtime();
  const json = await response.json();
  const diff = process.hrtime(time);
  const ms = convertNanToMilliSeconds(diff);
  return ms;
}

function stringifyJson(json) {
  const time = process.hrtime();
  const string = JSON.stringify(json);
  const diff = process.hrtime(time);
  const ms = convertNanToMilliSeconds(diff);
  return ms;
}

module.exports = { fetchData, parseJson, stringifyJson };
