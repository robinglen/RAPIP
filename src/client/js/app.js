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
    const timings = performance.getEntriesByName("fetch-request-audit")[0]
      .duration;
    return {
      data: response,
      timings: timings.toFixed(0)
    };
  } catch (error) {
    console.log(error);
  }
}

function getDataWithXHR(url, headers = {}, callback) {
  var request = new XMLHttpRequest();
  request.onload = response => {
    performance.mark("xhr-request-end");

    performance.measure(
      "xhr-request-audit",
      "xhr-request-start",
      "xhr-request-end"
    );

    const timings = performance.getEntriesByName("xhr-request-audit")[0]
      .duration;

    callback({
      data: response.target.response,
      timings: timings.toFixed(0)
    });
  };

  performance.mark("xhr-request-start");
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
  const request = await fetchData(path);
  const parse = await parseJson(request.data);
  const performanceMetrics = formatPerformanceMetrics(
    "Fetch",
    request,
    parse,
    path
  );
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
      console.log(performanceMetrics);
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
// Example using the NET-A-PORTER product api
function performanceDemo() {
  performanceTestApiWithXHR("https://httpbin.org/user-agent");

  performanceTestApiWithFetch("https://httpbin.org/user-agent");
}
