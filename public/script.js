'use strict';

// Initializes the canvas, draws an image scaling its size
// and shifts the position to the center of the screen.
function initCanvas(imgUrl, response) {
    var canvas = document.getElementById('panel-canvas');
    var panelBody = document.getElementById('panel-body');
    var context = canvas.getContext('2d');
    var imgObj = new Image();

    context.canvas.width = window.innerHeight;
    context.canvas.height = window.innerHeight;

    imgObj.onload = function() {
        var hRatio = context.canvas.width / imgObj.width;
        var vRatio = context.canvas.height / imgObj.height;
        var ratio = Math.min(hRatio, vRatio);

        var scaledImageWidth = imgObj.width * ratio;
        var scaledImageHeight = imgObj.height * ratio;
        var centerShiftX = (canvas.width - scaledImageWidth) / 2;
        var centerShiftY = (canvas.height - scaledImageHeight) / 2;

        context.scale = {
            centerShiftX: centerShiftX,
            centerShiftY: centerShiftY,
            imageWidth: scaledImageWidth,
            imageHeight: scaledImageHeight
        };

        context.drawImage(imgObj, 0, 0, imgObj.width, imgObj.height,
            centerShiftX, centerShiftY, scaledImageWidth, scaledImageHeight);

        // console.log(response);
        // var Response = JSON.stringify(response);

        var teststring = response.replace(/\n/g, ' ');

        drawOutput(JSON.parse(teststring), this, context);
        // drawOutput(response, this, context);
    };

    imgObj.src = imgUrl;

}

// var teststring = test().replace(/\n/g, ' ');
// drawOutput(teststring);

// Iterates each annotation in the response and
// calls to the respective drawing method.
function drawOutput(responses, imgObj, context) {

    // var jsonParse = JSON.parse(responses);
    for (var i = 0; i < responses.length; i++) {
        var response = responses[i];
        // console.log(response);

        if (response.textAnnotations) {
            drawText(response.textAnnotations, imgObj, context);
            // console.log(response.textAnnotations[0].description);
            var print = document.getElementsByClassName("prettyprint")[0];
            print.innerHTML = response.textAnnotations[0].description;
        } else if (response.faceAnnotations) {
            drawFace(response.faceAnnotations, imgObj, context);
            console.log(response.faceAnnotations);
        }
    }
    // if (responses.responses[0].textAnnotations){
    //   console.log('text');
    // } else if (responses.responses[0].faceAnnotations){
    //   console.log('image');
    // }

    // console.log(responses);
}

// Draws two boxes surrounding the head and the skin part of the face
// and the face features.
function drawFace(faceAnnotations, imgObj, context) {
    for (var i = 0; i < faceAnnotations.length; i++) {
        var annotation = faceAnnotations[i];

        drawRectangle(annotation.boundingPoly.vertices, imgObj, context, 'red', 1, 0);

        // Part that encloses only the skin part of the face
        drawRectangle(annotation.fdBoundingPoly.vertices, imgObj, context, 'green', 1, 0);

        drawCircles(annotation.landmarks, imgObj, context);
    }
}

function drawText(textAnnotations, imgObj, context) {
    for (var i = 0; i < textAnnotations.length; i++) {
        var annotation = textAnnotations[i];

        var regex = /^[0-9]+$/ig;
        var numbers = annotation.description;

        // console.log(numbers);
        // regex.test(numbers);

        // var checkNumber = regex.test(numbers);

        if(regex.test(numbers) || $.isNumeric(numbers)){
          drawRectangle(annotation.boundingPoly.vertices, imgObj, context, 'red', 1, 5);
        }else{
          drawRectangle(annotation.boundingPoly.vertices, imgObj, context, 'green', 1, 0);
        }
    }
}

// Draws circles using the face-specific landmarks coordinates.
function drawCircles(landmarks, imgObj, context) {
    var radius = 3;

    for (var i = 0; i < landmarks.length; i++) {
        var landmark = landmarks[i];
        var x = scaleX(landmark.position.x, imgObj, context);
        var y = scaleY(landmark.position.y, imgObj, context);

        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI, false);
        context.lineWidth = 0.5;
        context.strokeStyle = 'red';
        context.stroke();
    }
}

// Draws a rectangle using the top left and right bottom vertices.
function drawRectangle(vertices, imgObj, context, color, lineWidth, padding) {
    var v1 = getMinVertice(vertices);
    var v2 = getMaxVertice(vertices);
    var topLeft = {
        x: scaleX(v1.x, imgObj, context),
        y: scaleY(v1.y, imgObj, context)
    };
    var bottomRight = {
        x: scaleX(v2.x, imgObj, context),
        y: scaleY(v2.y, imgObj, context)
    };

    context.beginPath();
    context.lineWidth = lineWidth;
    context.strokeStyle = color;
    context.rect(
        topLeft.x - (padding/2.2) ,
        topLeft.y - (padding/2.2),
        (bottomRight.x - topLeft.x) + padding,
        (bottomRight.y - topLeft.y) + padding
    );
    context.stroke();
}

// Returns the bottom right vertice.
function getMaxVertice(vertices) {
    return vertices.reduce(function(prev, curr) {
        prev.x = isNaN(prev.x) ? -Infinity : prev.x;
        prev.y = isNaN(prev.y) ? -Infinity : prev.y;
        curr.x = isNaN(curr.x) ? -Infinity : curr.x;
        curr.y = isNaN(curr.y) ? -Infinity : curr.y;

        return (prev.x >= curr.x) && (prev.y >= curr.y) ? prev : curr;
    });
}

// Returns the top left vertice.
function getMinVertice(vertices) {
    return vertices.reduce(function(prev, curr) {
        prev.x = isNaN(prev.x) ? Infinity : prev.x;
        prev.y = isNaN(prev.y) ? Infinity : prev.y;
        curr.x = isNaN(curr.x) ? Infinity : curr.x;
        curr.y = isNaN(curr.y) ? Infinity : curr.y;

        return (prev.x <= curr.x) && (prev.y <= curr.y) ? prev : curr;
    });
}

// Returns a X-coordinate scaled according to the image size 
// scaled in the canvas.
function scaleX(x, imgObj, context) {
    return ((context.scale.imageWidth * x) / imgObj.width) + context.scale.centerShiftX;
}

// Returns a Y-coordinate scaled according to the image size 
// scaled in the canvas.
function scaleY(y, imgObj, context) {
    return ((context.scale.imageHeight * y) / imgObj.height) + context.scale.centerShiftY;
}