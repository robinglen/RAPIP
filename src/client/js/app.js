// ok there is a bug always reporting the same

async function fetchData(url, headers) {
  try {
    performance.mark("fetch-request-start");
    const response = await fetch(url, {
      headers: headers
    });
    performance.mark("fetch-request-end");
    performance.measure(
      "fetch-request-audit",
      "fetch-request-start",
      "fetch-request-end"
    );

    const performanceMeasures = performance.getEntriesByName(
      "fetch-request-audit"
    );
    const timings = performanceMeasures[
      performanceMeasures.length - 1
    ].duration.toFixed(0);

    let performanceObj = {
      data: response,
      timings: timings
    };

    // checking for performance overheads of using rapip proxy
    const rapipProxyHeader = response.headers.get("x-rapip-proxy");
    console.log(rapipProxyHeader);
    let rapipProxyOverhead = 0;
    if (rapipProxyHeader) {
      rapipProxyOverhead = response.headers.get("x-rapip-proxy-overhead");
      // adding a proxy object which users might find useful
      performanceObj.proxy = {
        requestTime: timings,
        proxyOverhead: rapipProxyOverhead,
        requestTimeWithCorrection: (timings - rapipProxyOverhead).toFixed(0)
      };
      performanceObj.timings = performanceObj.proxy.requestTimeWithCorrection;
    }
    return performanceObj;
  } catch (error) {
    console.log(error);
  }
}

function getDataWithXHR(url, headers = {}, callback) {
  performance.mark("xhr-request-start");
  var request = new XMLHttpRequest();
  request.onload = response => {
    performance.mark("xhr-request-end");

    performance.measure(
      "xhr-request-audit",
      "xhr-request-start",
      "xhr-request-end"
    );

    const performanceMeasures = performance.getEntriesByName(
      "xhr-request-audit"
    );
    const timings = performanceMeasures[
      performanceMeasures.length - 1
    ].duration.toFixed(0);

    let performanceObj = {
      data: response.target.response,
      timings: timings
    };

    // checking for performance overheads of using rapip proxy
    const rapipProxyHeader = request.getResponseHeader("x-rapip-proxy");
    let rapipProxyOverhead = 0;
    if (rapipProxyHeader) {
      rapipProxyOverhead = request.getResponseHeader("x-rapip-proxy-overhead");
      // adding a proxy object which users might find useful
      performanceObj.proxy = {
        requestTime: timings,
        proxyOverhead: rapipProxyOverhead,
        requestTimeWithCorrection: (timings - rapipProxyOverhead).toFixed(0)
      };
      performanceObj.timings = performanceObj.proxy.requestTimeWithCorrection;
    }

    callback(performanceObj);
  };

  for (var header in headers) {
    requet.setRequestHeader(header, headers[header]);
  }
  request.open("GET", url, true);
  request.send();
}

async function parseJson(response) {
  performance.mark("parse-start");
  const json = await response.json();
  performance.mark("parse-end");
  performance.measure("parse-audit", "parse-start", "parse-end");
  const timings = performance.getEntriesByName("parse-audit")[0].duration;
  return timings.toFixed(0);
}

function parseStringToJSON(data) {
  performance.mark("parse-string-start");
  const json = JSON.parse(data);
  performance.mark("parse-string-end");
  performance.measure(
    "parse-string-audit",
    "parse-string-start",
    "parse-string-end"
  );
  const timings = performance.getEntriesByName("parse-string-audit")[0]
    .duration;
  return timings.toFixed(0);
}

async function performanceTestApiWithFetch(path) {
  const response = await fetchData(path);
  const parse = await parseJson(response.data);
  const performanceMetrics = formatPerformanceMetrics(
    "Fetch",
    response,
    parse,
    path
  );
  if (response.proxy) {
    performanceMetrics.proxy = response.proxy;
  }
  console.log(performanceMetrics);
  return JSON.stringify(performanceMetrics);
}

function performanceTestApiWithXHR(path) {
  return new Promise((resolve, reject) => {
    const timings = getDataWithXHR(path, null, response => {
      const parse = parseStringToJSON(response.data);
      const performanceMetrics = formatPerformanceMetrics(
        "XHR",
        response,
        parse,
        path
      );
      if (response.proxy) {
        performanceMetrics.proxy = response.proxy;
      }
      console.log(performanceMetrics);
      performance.clearResourceTimings();
      resolve(JSON.stringify(performanceMetrics));
    });
  });
}

function formatPerformanceMetrics(name, request, parse, api) {
  return {
    name: name,
    request: {
      raw: Number(request.timings),
      message: `${request.timings}ms`
    },
    parse: {
      raw: Number(parse),
      message: `${parse}ms`
    }
  };
}

// A performance demo you can call if you want to test just in the browser
function performanceDemo() {
  performanceTestApiWithXHR("https://httpbin.org/user-agent");

  performanceTestApiWithFetch("https://httpbin.org/user-agent");
}
