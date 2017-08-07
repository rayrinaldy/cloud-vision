'use strict';

var express = require('express');
var path = require('path');
var session = require('cookie-session');
var mongoose = require('mongoose');
var app = express();

// Setup modules and dependencies
var config = require('./config');
var storageClient = require('./lib/storageClient')(
  config.gcloud, 
  config.gcloudStorageBucket
);
var cloudVisionClient = require('./lib/cloudVisionClient')(
  config.gcloudVision
);

mongoose.connect('mongodb://localhost/ocr', function(err){
  if(err){
    console.log('\x1b[36m%s\x1b[0m','Cannot connect to the database');
  } else{
    console.log('\x1b[31m','Connected to database at port','\x1b[32m','27017');
    // console.log('\x1b[32m','27017');
  }
});


// Set view template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Configure the session and session storage.
// app.use(session({
//   secret: config.secret,
//   signed: true
// }));

// // OAuth2
// var oauth2 = require('./lib/oauth2')(config.oauth2);
// app.use(oauth2.router);
// app.use(oauth2.aware);
// app.use(oauth2.template);

// Configure routes
app.use('/', require('./lib/routes')(
  storageClient,
  cloudVisionClient
));

// Basic 404 handler
app.use(function(req, res) {
  res.status(404).send('Not Found');
});

// Basic error handler
app.use(function(err, req, res, next) {
  console.error(err);

  // Send response if exists, if not send a custom message
  res.status(500).send(err.response || 'Server failed!');
});

// Start the server
var server = app.listen(process.env.PORT || 8080, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});

module.exports = app;
