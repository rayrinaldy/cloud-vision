var path = require('path');

var vision = require('@google-cloud/vision')({
    projectId: 'ray-ocr',
    keyFilename: path.resolve(__dirname, '../config/ray-ocr-be21fccbb0ed.json')
});

// var vision = new Vision();

// The name of the image file to annotate
var fileName = path.resolve(__dirname, './test.jpg');

// Prepare the request object
var request = {
    source: {
        filename: fileName
    }
};

// Performs label detection on the image file
vision.labelDetection(request)
    .then((results) => {
        const labels = results[0].labelAnnotations;

        console.log('Labels:');
        labels.forEach((label) => console.log(label.description));
    })
    .catch((err) => {
        console.error('ERROR:', err);
    });