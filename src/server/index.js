const { fetchData, parseJson, stringifyJson } = require('./utils');

const performanceTestApi = async path => {
  const request = await fetchData(path);
  const parse = await parseJson(request.data);
  const stringify = stringifyJson(request.data);

  return {
    request: {
      raw: request.timings,
      message: `${request.timings}ms`
    },
    parse: {
      raw: parse,
      message: `${parse}ms`
    },
    responseSize: {
      raw: request.responseSize,
      message: `${request.responseSize}kb`
    },
    path: path
  };
};

module.exports = performanceTestApi;
