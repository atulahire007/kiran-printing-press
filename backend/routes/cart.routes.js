const express = require('express');
const router = express.Router();
const { Cart, Coupon } = require('../models/index');
const Product = require('../models/Product.model');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/', async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product', 'name images basePrice discountPrice stock slug');
  res.json({ success: true, data: { cart: cart || { items: [], subtotal: 0, itemCount: 0 } } });
});

router.post('/add', async (req, res) => {
  const { productId, quantity = 1, customization, designFile } = req.body;
  const product = await Product.findById(productId);
  if (!product || product.status !== 'active') return res.status(404).json({ success: false, message: 'Product not found' });
  let cart = await Cart.findOne({ user: req.user.id }) || new Cart({ user: req.user.id, items: [] });
  const existingIdx = cart.items.findIndex(i => i.product.toString() === productId);
  const unitPrice = product.getPriceForQty(quantity);
  if (existingIdx > -1) {
    cart.items[existingIdx].quantity += quantity;
    cart.items[existingIdx].unitPrice = product.getPriceForQty(cart.items[existingIdx].quantity);
  } else {
    cart.items.push({ product: productId, quantity, unitPrice, customization, designFile });
  }
  cart.lastActivity = new Date();
  await cart.save();
  res.json({ success: true, message: 'Added to cart', data: { cart } });
});

router.put('/item/:itemId', async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
  const item = cart.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  if (quantity <= 0) {
    cart.items.pull({ _id: req.params.itemId });
  } else {
    const product = await Product.findById(item.product);
    item.quantity = quantity;
    item.unitPrice = product.getPriceForQty(quantity);
  }
  await cart.save();
  res.json({ success: true, data: { cart } });
});

router.delete('/item/:itemId', async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
  cart.items.pull({ _id: req.params.itemId });
  await cart.save();
  res.json({ success: true, data: { cart } });
});

router.post('/coupon', async (req, res) => {
  const { code } = req.body;
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon || !coupon.isValid()) return res.status(400).json({ success: false, message: 'Invalid coupon' });
  const discount = coupon.calculateDiscount(cart.subtotal);
  cart.coupon = coupon._id;
  cart.couponDiscount = discount;
  await cart.save();
  res.json({ success: true, message: `Coupon applied! Saving ₹${discount}`, data: { discount } });
});

router.delete('/coupon', async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user.id }, { coupon: null, couponDiscount: 0 });
  res.json({ success: true, message: 'Coupon removed' });
});

router.delete('/', async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user.id }, { items: [], coupon: null, couponDiscount: 0 });
  res.json({ success: true, message: 'Cart cleared' });
});

module.exports = router;
