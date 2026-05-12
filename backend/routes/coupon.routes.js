const express = require('express');
const router = express.Router();
const { Coupon } = require('../models/index');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.post('/validate', protect, async (req, res) => {
  const { code, orderValue = 0 } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon || !coupon.isValid()) return res.status(400).json({ success: false, message: 'Invalid or expired coupon' });
  const discount = coupon.calculateDiscount(orderValue);
  res.json({ success: true, data: { coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue }, discount } });
});

router.get('/', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, data: { coupons } });
});

router.post('/', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const coupon = await Coupon.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ success: true, data: { coupon } });
});

router.put('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: { coupon } });
});

router.delete('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Deleted' });
});

module.exports = router;
