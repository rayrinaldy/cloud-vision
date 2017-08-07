var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema for our links
var ImgData = new Schema({
    image_url: {
        type: String,
        required: true,
        unique: true
    },
    json_data:{
        type: String,
        required: true,
        unique: true
    },
    created_at: {
        type: Date,
        default: new Date(),
    }
});

module.exports = mongoose.model('ImgData', ImgData);