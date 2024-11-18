// backend/routes/imageRoutes.js
const express = require('express');
const multer = require('multer');
const { uploadImage, addTooltip, getImageWithTooltips, getAllImages, updateImageDetails, updateImageFinishDetail, updateTooltipPosition, deleteImage, deleteMultipleImages } = require('../controllers/imageController');
const auth = require('../middleware/auth');

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 50 * 1024 * 1024 } // Limit file size to 5 MB, adjust as needed
});

const router = express.Router();

router.post('/upload',auth, upload.single('image'), uploadImage);
router.post('/tooltip', addTooltip);
router.get('/:imageId', getImageWithTooltips);
router.get('/',auth, getAllImages);
router.put('/:imageId/details', updateImageDetails);
router.put('/:imageId/finish', updateImageFinishDetail);
router.put('/tooltips/:tooltipId', updateTooltipPosition);
// Add these new routes
router.delete('/delete/:imageId',auth, deleteImage);
router.delete('/bulk-delete',auth, deleteMultipleImages);


module.exports = router;
