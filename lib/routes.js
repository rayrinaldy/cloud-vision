'use strict';

var assign = require('lodash').assign;
var express = require('express');
var router = express.Router();
var values = require('lodash').values;
var mongoose = require('mongoose');
var imgData = require('../models/data.js');

var routes = function(storageClient, cloudVisionClient) {
    var defaultContext = {
        featureTypes: values(cloudVisionClient.featureTypes)
    };

    router.get('/', function(req, res) {
        imgData.find(function(err ,items){
            res.render('base', {
                defaultContext: defaultContext,
                data: items
            });
        });
        // res.render('base', {
        //     defaultContext: defaultContext
        // });
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

                        }

                        var newSave = new imgData({
                            image_url: context.vision.imageUrl,
                            json_data: context.vision.response
                        });
                        
                        newSave.save(function(err, result) {

                            if (err) {
                                console.log(err);
                            }else{
                                imgData.find(function(err ,items){
                                    res.redirect('/');
                                });
                            }

                            // res.render('base', {
                            //     context: context,
                            //     defaultContext: defaultContext
                            // });
                        });
                        // res.render('base', {
                        //     context: context,
                        //     defaultContext: defaultContext
                        // });
                    }
                );
            } else {
                context.error = 'Something went wrong uploading the image!';
                res.render('base', {
                    context: context,
                    defaultContext: defaultContext
                });
            }

        });

    return router;
};

module.exports = routes;