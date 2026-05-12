const express = require('express');
const router = express.Router();
const { Testimonial, Banner } = require('../models/index');

// Public CMS endpoints
router.get('/testimonials', async (req, res) => {
  const testimonials = await Testimonial.find({ isActive: true, isFeatured: true }).sort({ sortOrder: 1 }).limit(8);
  res.json({ success: true, data: { testimonials } });
});

router.get('/home-data', async (req, res) => {
  const [banners, testimonials] = await Promise.all([
    Banner.find({ isActive: true, position: 'hero' }).sort({ sortOrder: 1 }).limit(5),
    Testimonial.find({ isActive: true, isFeatured: true }).sort({ sortOrder: 1 }).limit(6),
  ]);
  res.json({ success: true, data: { banners, testimonials } });
});

module.exports = router;
