require('dotenv').config();
const APP_PORT = process.env.APP_PORT || 3000;
const HOST_NAME = process.env.HOST_NAME;
const GIT_BRANCH = process.env.GIT_BRANCH;

var express = require('express');
var app = express();
app.get('/', function (req, res) {
  res.send('Hello World ' + HOST_NAME  + ' | Branch: ' + GIT_BRANCH + '!');
});
app.listen(APP_PORT, function () {
  console.log('Example app listening on port ' + APP_PORT + ' | Host: ' + HOST_NAME  + ' | Branch: ' + GIT_BRANCH + '!');
});