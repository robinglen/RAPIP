const fs = require('fs');
const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const app = express();

const dir = path.dirname(fs.realpathSync(__filename));

app.use(express.static(`${dir}/js`));
app.set('views', `${dir}/views`);
app.engine(
  'handlebars',
  exphbs({ defaultLayout: 'main', layoutsDir: `${dir}/views/layouts` })
);
app.set('view engine', 'handlebars');

app.get('/', function(req, res) {
  res.render('home');
});

module.exports = app;
