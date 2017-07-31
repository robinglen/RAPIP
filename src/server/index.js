const { fetchData, parseJson, stringifyJson } = require("./utils");

const performanceTestApi = async (api, headers = {}) => {
  try {
    const request = await fetchData(api, headers);
    const parse = await parseJson(request.data);
    const stringify = stringifyJson(request.data);
    return _formatPerformanceMetrics(api, request, parse, stringify);
  } catch (error) {
    return { error: error };
  }
};

function _formatPerformanceMetrics(api, request, parse, stringify) {
  return {
    response: {
      request: {
        raw: Number(request.timings),
        message: `${request.timings}ms`
      },
      parse: {
        raw: Number(parse),
        message: `${parse}ms`
      },
      size: {
        raw: Number(request.size),
        message: `${request.size}kb`
      },
      stringify: {
        raw: Number(stringify),
        message: `${stringify}ms`
      },
      gzipEnabled: request.gzipEnabled,
      api: api
    }
  };
}

module.exports = { performanceTestApi, _formatPerformanceMetrics };
