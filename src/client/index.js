const fs = require("fs");
const path = require("path");
const express = require("express");
const exphbs = require("express-handlebars");
const request = require("request-promise");
const utils = require("../server/utils");
const zlib = require("zlib");
const app = express();

const dir = path.dirname(fs.realpathSync(__filename));

app.disable("x-powered-by");
app.use(express.static(`${dir}/js`));
// no need to really use express but might want to expand functionailty later
app.set("views", `${dir}/views`);
app.engine(
  "handlebars",
  exphbs({ defaultLayout: "main", layoutsDir: `${dir}/views/layouts` })
);
app.set("view engine", "handlebars");

app.get("/", (req, res) => {
  res.render("home");
});

// this is a workaround for apis that don't have CORS enabled
// it will also take account for its own latency giving an overhead
// response header which can be removed from the response time
// its less than ideal but I've made a feature request to chrome
// to get around this:
// https://t.co/vUbhobbDYT
app.get("/api", (req, res) => {
  // collecting headers and making it possible to proxy the api request
  const requestHeaders = req.headers;
  const api = requestHeaders["x-rapip-api"];
  const headers = requestHeaders["x-rapip-headers"];
  let headersObj = {};
  if (headers) {
    headersObj = JSON.parse(headers);
  }
  delete requestHeaders["x-rapip-api"];
  delete requestHeaders["x-rapip-headers"];

  (async () => {
    try {
      const response = await request({
        uri: api,
        headers: headersObj,
        resolveWithFullResponse: true
      });
      const time = process.hrtime();
      const headers = getProxyHeaders(response.headers);
      //         if (headers["content-encoding"] === "gzip") {
      //           // if the api wants a json response gzip it
      //           zlib.gzip(JSON.stringify(body), (error, result) => {
      //             render(result);
      //           });
      //         } else {
      //           console.log("no gzip");
      //           render(body);
      //         }
      render(headers, response, time);
    } catch (error) {
      res.end(error);
      console.log(error);
    }
  })();

  function render(headers, body, time) {
    // calculate how much overtime this proxy took
    const diff = process.hrtime(time);
    const proxyOverhead = utils.convertNanToMilliSeconds(diff);

    headers["x-rapip-proxy-overhead"] = proxyOverhead;

    res.set(headers);
    res.send(body);
  }
});

function getProxyHeaders(headers) {
  // add RAPIP requried headers
  headers["access-control-expose-headers"] =
    "x-rapip-proxy, x-rapip-proxy-overhead";
  headers["access-control-allow-origin"] = "*";
  headers["x-rapip-proxy"] = "HIT";
  return headers;
}

module.exports = app;
