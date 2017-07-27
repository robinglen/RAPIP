const fs = require('fs');
const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const fetch = require('node-fetch');
const app = express();

const dir = path.dirname(fs.realpathSync(__filename));

app.use(express.static(`${dir}/js`));
// no need to really use express but might want to expand functionailty later
app.set('views', `${dir}/views`);
app.engine(
  'handlebars',
  exphbs({ defaultLayout: 'main', layoutsDir: `${dir}/views/layouts` })
);
app.set('view engine', 'handlebars');

app.get('/', (req, res) => {
  res.render('home');
});

// this is a workaround for apis that don't have CORS enabled
// its less than ideal but I've made a feature request to chrome
// to get around this:
// https://t.co/vUbhobbDYT
app.get('/api', (req, res) => {
  const api = req.query.api;
  // convert this shit to await
  const response = fetch(api)
    .then(response => {
      // iterate headers and check for gzip, gzip if possible, add cross origin header
      response.json().then(body => {
        res.json(body);
      }).catch(error => {
        res.send(error);
      };
    })
    .catch(error => {
      res.send(error);
    });
});

module.exports = app;
