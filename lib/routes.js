/*
   Copyright 2016, Google, Inc.
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
       http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

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
        res.render('base', defaultContext);
    });

    router.post('/',
        // storageClient.multer.single('image'),
        // Multiple upload
        storageClient.multer.array('image', 2),
        storageClient.uploadToStorage,
        function(req, res) {

            function getData(file) {
                cloudVisionClient.detectImage(
                    file.cloudStorageUri,
                    req.body.imageType,
                    req.body.maxResults,

                    function(error, response) {
                        if (error) {
                            context.error = error;
                        } else {
                            var vision = {};
                            // Indent 2 spaces the json response if exists.
                            vision.prettyprint = response ? JSON.stringify(response, null, 2) : null;
                            vision.imageUrl = file.cloudStoragePublicUrl;
                            vision.response = JSON.stringify(response.responses);

                            context.push(vision);
                            if (counter === req.files.length - 1) {
                                console.log(context);
                            }else{
                              counter++;
                              getData(req.files[counter]);
                            }
                        }

                    }
                );
            }

            var context = [],
                counter = 0;

            getData(req.files[counter]);


        });

    return router;
};

module.exports = routes;