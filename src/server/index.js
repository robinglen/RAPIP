const { fetchData, parseJson, stringifyJson } = require("./utils");

const performanceTestApi = async (api, headers = {}) => {
  try {
    const request = await fetchData(api, headers);
    const parse = await parseJson(request.data);
    const stringify = stringifyJson(request.data);
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
        responseSize: {
          raw: Number(request.responseSize),
          message: `${request.responseSize}kb`
        },
        stringify: {
          raw: Number(stringify),
          message: `${stringify}ms`
        },
        gzipEnabled: request.gzipEnabled,
        api: api
      }
    };
  } catch (error) {
    return { error: error };
  }
};

module.exports = performanceTestApi;
