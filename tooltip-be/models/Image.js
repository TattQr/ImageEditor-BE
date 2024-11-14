// backend/models/Image.js
const mongoose = require('mongoose');

const TooltipSchema = new mongoose.Schema({
    x: Number,
    y: Number,
    title: String,
    subtitle: String,
    description: String,
    links: [String],
    size: String,         // New field for size
    iconStyle: String,    // New field for icon style
    color: String,  // New field for color
    innerImage: String
});

const ImageSchema = new mongoose.Schema({
    projectName: String,
    width:Number,
    Height:Number,    
    url: String,
    size: String,         // New field for size
    iconStyle: String,    // New field for icon style
    color: String, 
    finished: Boolean,
    tooltips: [TooltipSchema],
});

module.exports = mongoose.model('Image', ImageSchema);
