'use strict';

var assign = require('lodash').assign;
var express = require('express');
var router = express.Router();
var values = require('lodash').values;

var routes = function(storageClient, cloudVisionClient) {
  var defaultContext = {
    featureTypes: values(cloudVisionClient.featureTypes)
  };

  router.get('/', function(req, res) {
    res.render('base', {defaultContext: defaultContext});
  });

  router.post('/', 
    storageClient.multer.single('image'),
    storageClient.uploadToStorage,
    function(req, res) {
      var context = {
        vision: {}
      };

      if (req.file && req.file.cloudStoragePublicUrl) {
        cloudVisionClient.detectImage(
          req.file.cloudStorageUri, 
          req.body.imageType, 
          req.body.maxResults,
          function(error, response) {
            if (error) {
              context.error = error;
            } else {
              // Indent 2 spaces the json response if exists.
              // console.log(response);
              context.vision.prettyprint = response ? JSON.stringify(response, null, 2) : null;
              context.vision.imageUrl = req.file.cloudStoragePublicUrl;
              context.vision.response = JSON.stringify(response.responses);
              // context.vision.response = response.responses;

              // console.log(context.vision.response);

            }
            res.render('base', {context: context, defaultContext: defaultContext});
          }
        );        
      } else {
        context.error = 'Something went wrong uploading the image!';
        res.render('base', {context: context, defaultContext: defaultContext});
      }
  });

  return router;
};

module.exports = routes;
