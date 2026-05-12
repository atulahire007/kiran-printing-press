const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { uploadDesignFile, uploadBanner, uploadGallery, cloudinary } = require('../config/cloudinary');
const { DesignFile } = require('../models/index');

// Upload design file
router.post('/design', protect, uploadDesignFile.single('design'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const design = await DesignFile.create({
    user: req.user.id, public_id: req.file.filename, url: req.file.path,
    fileName: req.file.originalname, fileSize: req.file.size,
    mimeType: req.file.mimetype, fileType: req.file.originalname.split('.').pop().toLowerCase(),
  });
  res.status(201).json({ success: true, message: 'Design uploaded', data: design });
});

// Upload banner (admin)
router.post('/banner', protect, uploadBanner.single('banner'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, data: { public_id: req.file.filename, url: req.file.path } });
});

// Upload gallery (admin)
router.post('/gallery', protect, uploadGallery.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, data: { public_id: req.file.filename, url: req.file.path } });
});

module.exports = router;
