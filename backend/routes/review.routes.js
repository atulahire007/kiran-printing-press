const express = require('express');
const router = express.Router();
const { Review } = require('../models/index');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.post('/', protect, async (req, res) => {
  const existing = await Review.findOne({ user: req.user.id, product: req.body.product });
  if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
  const review = await Review.create({ ...req.body, user: req.user.id });
  res.status(201).json({ success: true, data: { review } });
});

router.get('/product/:productId', async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, isApproved: true })
    .populate('user', 'name avatar').sort({ createdAt: -1 }).limit(20);
  res.json({ success: true, data: { reviews } });
});

router.put('/:id/approve', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  await Review.updateProductRating(review.product);
  res.json({ success: true, data: { review } });
});

router.delete('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (review) await Review.updateProductRating(review.product);
  res.json({ success: true, message: 'Deleted' });
});

module.exports = router;
