'use strict';

var gcloud = require('gcloud');

module.exports = function(gcloudConfig, gcloudStorageBucket) {
  var storage = gcloud.storage(gcloudConfig);
  var bucket = storage.bucket(gcloudStorageBucket);

  // Returns the public, anonymously accessable URL to a given Cloud Storage
  // object.
  function getPublicUrl(filename) {
    return 'https://storage.googleapis.com/' +
      gcloudStorageBucket +
      '/' + filename;
  }

  // Returns the Google Cloud Storage object URI.
  function getStorageUri(filename) {
    return 'gs://' +
      gcloudStorageBucket +
      '/' + filename;
  }

  // Express middleware that will automatically pass uploads to Cloud Storage.
  // req.file is processed and will have two new properties:
  // * ``cloudStorageObject`` the object name in cloud storage.
  // * ``cloudStoragePublicUrl`` the public url to the object.
  // * ``cloudStorageUri`` google cloud storage object URI.
  function uploadToStorage(req, res, next) {
    if(!req.file) { 
      next();
    }

    var gcsname = Date.now() + req.file.originalname;
    var file = bucket.file(gcsname);
    var stream = file.createWriteStream();

    stream.on('error', function(err) {
      req.file.cloudStorageError = err;
      next(err);
    });

    stream.on('finish', function() {
      req.file.cloudStorageObject = gcsname;
      req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
      req.file.cloudStorageUri = getStorageUri(gcsname);
      next();
    });

    stream.end(req.file.buffer);
  }

  // Multer handles parsing multipart/form-data requests.
  // This instance is configured to store images in memory and re-name to avoid
  // conflicting with existing objects. This makes it straightforward to upload
  // to Cloud Storage.
  var multer = require('multer')({
    inMemory: true,
    fileSize: 5 * 1024 * 1024, // no larger than 5mb
    rename: function(fieldname, filename) {
      // generate a unique filename
      return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
    }
  });

  return {
    multer: multer,
    uploadToStorage: uploadToStorage
  };
};
