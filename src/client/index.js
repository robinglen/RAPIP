const fs = require("fs");
const path = require("path");
const express = require("express");
const exphbs = require("express-handlebars");
const fetch = require("node-fetch");
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
  const api = req.query.path;
  const requestHeaders = req.headers;
  // if I remove this fetch and use request can I clean the logic of all this shit
  const response = fetch(api, requestHeaders)
    .then(response => {
      console.log("get response");
      const time = process.hrtime();
      response
        .json()
        .then(body => {
          console.log("-----------");
          console.log(body);
          console.log("-----------");

          // make sure we pas through the headers needed
          const headers = getProxyHeaders(response.headers._headers);

          // currently only supporting gzip because... argh
          if (headers["content-encoding"] === "gzip") {
            // if the api wants a json response gzip it
            zlib.gzip(JSON.stringify(body), (error, result) => {
              render(result);
            });
          } else {
            render(body);
          }

          function render(body) {
            // calculate how much overtime this proxy took
            const diff = process.hrtime(time);
            const proxyOverhead = utils.convertNanToMilliSeconds(diff);

            headers["x-rapip-proxy-overhead"] = proxyOverhead;

            // send that shit
            res.set(headers);
            res.send(body);
          }
        })
        .catch(error => {
          res.send(error);
        });
    })
    .catch(error => {
      res.send(error);
    });
});

function getProxyHeaders(headers) {
  const proxyHeaders = {};
  for (let header in headers) {
    proxyHeaders[header] = headers[header][0];
  }
  // add RAPIP requried headers
  proxyHeaders["access-control-expose-headers"] =
    "x-rapip-proxy, x-rapip-proxy-overhead";
  proxyHeaders["access-control-allow-origin"] = "*";
  proxyHeaders["x-rapip-proxy"] = "HIT";
  return proxyHeaders;
}

module.exports = app;
