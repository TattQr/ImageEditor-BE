// backend/controllers/imageController.js
const Image = require('../models/Image');
const fs = require('fs');




exports.uploadImage = async (req, res) => {
    // console.log("req.file", req.file);
    
    const imageUrl = `/uploads/${req.file.filename}`;

    const image = new Image({ url: imageUrl ? `https://keen-energy-production.up.railway.app${imageUrl}`: null, tooltips: [], userId: req.user._id });
    await image.save();
    res.json({ image });
};

// exports.uploadImage = async (req, res) => {
//     console.log("req.file", req.file);
//     console.log("project name", req.body.projectName);
//     console.log("style preferences", req.body.stylePreferences);
   
//     const imageUrl = `/uploads/${req.file.filename}`;
//     const stylePreferences = JSON.parse(req.body.stylePreferences);
//     const projectName = req.body.projectName; // Remove JSON.parse
   
//     const image = new Image({
//         projectName,
//         url: imageUrl,
//         tooltips: [],
//         iconStyle: stylePreferences.iconStyle,
//         size: stylePreferences.size,
//         color: stylePreferences.color
//     });
   
//     await image.save();
//     res.json({ image });
// };



// exports.uploadImage = async (req, res) => {
//     // console.log("req.file", req.file);

//     const imageUrl = `/uploads/${req.file.filename}`;
//     const image = new Image({
//         url: imageUrl,
//         tooltips: []
//     });

//     await image.save();
//     res.json({ image });
// };

// New controller method for updating image details
// exports.updateImageDetails = async (req, res) => {
//     const { imageId } = req.params;
//     const { projectName, stylePreferences } = req.body;

//     const image = await Image.findById(imageId);
//     if (!image) {
//         return res.status(404).json({ message: "Image not found" });
//     }

//     image.projectName = projectName;
//     image.iconStyle = stylePreferences.iconStyle;
//     image.size = stylePreferences.size;
//     image.color = stylePreferences.color;

//     await image.save();
//     res.json({ image });
// };
exports.updateImageDetails = async (req, res) => {
    const { imageId } = req.params;
    const { projectName, stylePreferences } = req.body;

    const image = await Image.findOne({ 
        _id: imageId,
        userId: req.user._id  // Verify user owns the image
    });
    
    if (!image) {
        return res.status(404).json({ message: "Image not found or unauthorized" });
    }

    image.projectName = projectName;
    image.iconStyle = stylePreferences.iconStyle;
    image.size = stylePreferences.size;
    image.color = stylePreferences.color;

    await image.save();
    res.json({ image });
};

// New controller method for updating image details
exports.updateImageFinishDetail = async (req, res) => {
    const { imageId } = req.params;
    const { finished } = req.body;

    const image = await Image.findById(imageId);
    if (!image) {
        return res.status(404).json({ message: "Image not found" });
    }

    image.finished = finished;

    await image.save();
    res.json({ image });
};




exports.addTooltip = async (req, res) => {
    const { imageId, tooltip } = req.body;
    
    // Convert base64 to image and save
    if (tooltip.innerImage) {
        const base64Data = tooltip.innerImage.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `tooltip_${Date.now()}.png`;
        
        // Save to filesystem
        fs.writeFileSync(`uploads/${filename}`, buffer);
        
        // Update tooltip object with file path
        tooltip.innerImage = `/uploads/${filename}`;
    }

    const image = await Image.findById(imageId);
    image.tooltips.push(tooltip);
    await image.save();
    res.json({ image });
};

exports.getImageWithTooltips = async (req, res) => {
    const image = await Image.findById(req.params.imageId).sort({ _id: -1 });
    res.json({ image });
};

// exports.getAllImages = async (req, res) => {
//     // const images = await Image.find();
//     const images = await Image.find().populate('tooltips').sort({ _id: -1 });
//     res.json({ images });
// };

exports.getAllImages = async (req, res) => {
    const images = await Image.find({ userId: req.user._id })
        .populate('tooltips')
        .sort({ _id: -1 });
    res.json({ images });
};

exports.updateTooltipPosition = async (req, res) => {
    const { tooltipId } = req.params;
    const { x, y } = req.body;

    const image = await Image.findOneAndUpdate(
        { "tooltips._id": tooltipId },
        { $set: { "tooltips.$.x": x, "tooltips.$.y": y } },
        { new: true }
    );

    if (!image) {
        return res.status(404).json({ message: "Tooltip not found" });
    }

    res.json({ message: "Tooltip position updated", tooltip: image.tooltips.id(tooltipId) });
};


// Delete single image
exports.deleteImage = async (req, res) => {
    try {
        const { imageId } = req.params;
        
        // Get image details from database
        const image = await Image.findOne({ 
            _id: imageId,
            userId: req.user._id
        });
        // const image = await Image.findById(imageId);
        if (!image) {
            return res.status(404).json({ message: "Image not found" });
        }

        // Delete main image file
        const mainImagePath = `.${image.url}`;
        if (fs.existsSync(mainImagePath)) {
            fs.unlinkSync(mainImagePath);
        }

        // Delete associated tooltip images if they exist
        image.tooltips.forEach(tooltip => {
            if (tooltip.innerImage) {
                const tooltipImagePath = `.${tooltip.innerImage}`;
                if (fs.existsSync(tooltipImagePath)) {
                    fs.unlinkSync(tooltipImagePath);
                }
            }
        });

        // Delete from database
        await Image.findByIdAndDelete(imageId);

        res.json({ message: "Image and associated files deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting image", error: error.message });
    }
};

// Delete multiple images
exports.deleteMultipleImages = async (req, res) => {
    try {
        const { imageIds } = req.body;

        if (!Array.isArray(imageIds)) {
            return res.status(400).json({ message: "imageIds must be an array" });
        }

        // Get all images
        const images = await Image.find({ 
            _id: { $in: imageIds },
            userId: req.user._id
        });
        // const images = await Image.find({ _id: { $in: imageIds } });

        // Delete all files
        images.forEach(image => {
            // Delete main image
            const mainImagePath = `.${image.url}`;
            if (fs.existsSync(mainImagePath)) {
                fs.unlinkSync(mainImagePath);
            }

            // Delete tooltip images
            image.tooltips.forEach(tooltip => {
                if (tooltip.innerImage) {
                    const tooltipImagePath = `.${tooltip.innerImage}`;
                    if (fs.existsSync(tooltipImagePath)) {
                        fs.unlinkSync(tooltipImagePath);
                    }
                }
            });
        });

        // Delete from database
        await Image.deleteMany({ _id: { $in: imageIds } });

        res.json({ 
            message: `Successfully deleted ${images.length} images and their associated files` 
        });
    } catch (error) {
        res.status(500).json({ message: "Error deleting images", error: error.message });
    }
};
