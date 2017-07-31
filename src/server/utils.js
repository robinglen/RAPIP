const request = require('request-promise');

async function fetchData(url, headers) {
  const time = process.hrtime();
  try {
    const response = await request({
      uri: url,
      headers: headers,
      resolveWithFullResponse: true
    });
    const diff = process.hrtime(time);
    const ms = convertNanToMilliSeconds(diff);
    console.log(response.headers);
    const size = response.headers['content-length'] / 1024;
    // add support for Accept-Encoding: "gzip, deflate, sdch, br",
    // currently only supporting gzip
    const contentEncoding = response.headers['content-encoding'];
    const gzipEnabled = contentEncoding === 'gzip' ? true : false;
    return {
      data: response,
      timings: ms,
      size: size.toFixed(2),
      gzipEnabled: gzipEnabled
    };
  } catch (error) {
    console.log(error);
  }
}

function convertNanToMilliSeconds(hrTimer) {
  const NS_PER_SEC = 1e9;
  const nanoSeconds = hrTimer[0] * NS_PER_SEC + hrTimer[1];
  const microSeconds = nanoSeconds / 1e3;
  const milliSeconds = microSeconds / 1e3;
  return milliSeconds.toFixed(0);
}

async function parseJson(response) {
  const time = process.hrtime();
  const json = JSON.parse(response.body);
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

module.exports = {
  convertNanToMilliSeconds,
  fetchData,
  parseJson,
  stringifyJson
};
