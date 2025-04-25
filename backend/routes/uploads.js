const express = require('express');
const router = express.Router();
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const { upload, getFileUrl } = require('../utils/imageUpload');

// Upload a single image
router.post('/images', authenticateToken, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded." });
        }
        
        // Return file URL
        const fileUrl = getFileUrl(req.file.filename);
        
        res.status(201).json({
            message: "Image uploaded successfully",
            url: fileUrl,
            file_name: req.file.filename,
            file_size: req.file.size
        });
    } catch (error) {
        console.error("Image upload error:", error);
        res.status(500).json({ error: "Image upload failed." });
    }
});

// Upload a before/after image pair for task completion
router.post('/task-images', authenticateToken, upload.fields([
    { name: 'before_image', maxCount: 1 },
    { name: 'after_image', maxCount: 1 }
]), (req, res) => {
    try {
        const beforeImage = req.files['before_image'] ? req.files['before_image'][0] : null;
        const afterImage = req.files['after_image'] ? req.files['after_image'][0] : null;
        
        if (!beforeImage && !afterImage) {
            return res.status(400).json({ error: "No files uploaded." });
        }
        
        // Build response
        const response = {
            message: "Images uploaded successfully"
        };
        
        if (beforeImage) {
            response.before_image = {
                url: getFileUrl(beforeImage.filename),
                file_name: beforeImage.filename,
                file_size: beforeImage.size
            };
        }
        
        if (afterImage) {
            response.after_image = {
                url: getFileUrl(afterImage.filename),
                file_name: afterImage.filename,
                file_size: afterImage.size
            };
        }
        
        res.status(201).json(response);
    } catch (error) {
        console.error("Task image upload error:", error);
        res.status(500).json({ error: "Image upload failed." });
    }
});

// Serve uploaded images (in a production environment, you'd use a dedicated file server)
router.get('/images/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../uploads', req.params.filename);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).json({ error: "Image not found." });
        }
    });
});

module.exports = router;