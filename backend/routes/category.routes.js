const express = require('express');
const { Category } = require('../models/index');
const { protect, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();

router.get('/', async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
  res.json({ success: true, data: { categories } });
});
router.get('/:slug', async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: { category } });
});
router.post('/', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const cat = await Category.create(req.body);
  res.status(201).json({ success: true, data: { category: cat } });
});
router.put('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: { category: cat } });
});
router.delete('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Deleted' });
});
module.exports = router;
