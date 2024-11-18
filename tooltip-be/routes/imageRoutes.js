// backend/routes/imageRoutes.js
const express = require('express');
// const multer = require('multer');
const { uploadImage, addTooltip, getImageWithTooltips, getAllImages, updateImageDetails, updateImageFinishDetail, updateTooltipPosition, deleteImage, deleteMultipleImages } = require('../controllers/imageController');
const auth = require('../middleware/auth');
const multer = require("multer");
const path = require("path");

// Configure storage options for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/")); // Set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Initialize multer with the storage options
const upload = multer({ storage: storage });

// const upload = multer({
//     dest: 'uploads/',
//     limits: { fileSize: 50 * 1024 * 1024 } // Limit file size to 5 MB, adjust as needed
// });

const router = express.Router();

router.post('/upload',auth, upload.single('image'), uploadImage);
router.post('/tooltip', addTooltip);
router.get('/:imageId', getImageWithTooltips);
router.get('/',auth, getAllImages);
router.put('/:imageId/details',auth, updateImageDetails);
router.put('/:imageId/finish', updateImageFinishDetail);
router.put('/tooltips/:tooltipId', updateTooltipPosition);
// Add these new routes
router.delete('/delete/:imageId',auth, deleteImage);
router.delete('/bulk-delete',auth, deleteMultipleImages);


module.exports = router;
