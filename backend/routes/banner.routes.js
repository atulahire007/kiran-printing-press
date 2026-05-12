const express = require('express');
const router = express.Router();
const { Banner } = require('../models/index');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.get('/', async (req, res) => {
  const { position = 'hero' } = req.query;
  const banners = await Banner.find({ isActive: true, position }).sort({ sortOrder: 1 });
  res.json({ success: true, data: { banners } });
});
router.post('/', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const banner = await Banner.create(req.body);
  res.status(201).json({ success: true, data: { banner } });
});
router.put('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: { banner } });
});
router.delete('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Deleted' });
});
module.exports = router;
