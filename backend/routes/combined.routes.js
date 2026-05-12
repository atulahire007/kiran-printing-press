// ══════════════════════════════════════════
// routes/category.routes.js
// ══════════════════════════════════════════
const express = require('express');
const { Category } = require('../models/index');
const { protect, authorize } = require('../middlewares/auth.middleware');

const catRouter = express.Router();

catRouter.get('/', async (req, res) => {
  const categories = await Category.find({ isActive: true, parent: null })
    .sort({ sortOrder: 1, name: 1 }).lean();
  res.json({ success: true, data: { categories } });
});

catRouter.get('/:slug', async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, data: { category } });
});

catRouter.post('/', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: { category } });
});

catRouter.put('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: { category } });
});

catRouter.delete('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
});

module.exports = catRouter;

// ══════════════════════════════════════════
// routes/order.routes.js
// ══════════════════════════════════════════
const orderExpress = require('express');
const orderRouter = orderExpress.Router();
const {
  placeOrder, createRazorpayOrder, verifyPayment, getMyOrders,
  getOrderById, cancelOrder, downloadInvoice,
  adminUpdateOrderStatus, adminGetAllOrders,
} = require('../controllers/order.controller');
const orderAuth = require('../middlewares/auth.middleware');

orderRouter.use(orderAuth.protect);
orderRouter.post('/', placeOrder);
orderRouter.post('/razorpay/create', createRazorpayOrder);
orderRouter.post('/razorpay/verify', verifyPayment);
orderRouter.get('/my-orders', getMyOrders);
orderRouter.get('/:id', getOrderById);
orderRouter.put('/:id/cancel', cancelOrder);
orderRouter.get('/:id/invoice', downloadInvoice);

// Admin
orderRouter.get('/', orderAuth.authorize('admin', 'superadmin'), adminGetAllOrders);
orderRouter.put('/:id/status', orderAuth.authorize('admin', 'superadmin'), adminUpdateOrderStatus);

module.exports = orderRouter;

// ══════════════════════════════════════════
// routes/cart.routes.js
// ══════════════════════════════════════════
const cartExpress = require('express');
const cartRouter = cartExpress.Router();
const { Cart, Coupon } = require('../models/index');
const Product = require('../models/Product.model');
const cartAuth = require('../middlewares/auth.middleware');

cartRouter.use(cartAuth.protect);

// Get cart
cartRouter.get('/', async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product', 'name images basePrice discountPrice stock slug');
  res.json({ success: true, data: { cart: cart || { items: [], subtotal: 0, itemCount: 0 } } });
});

// Add item
cartRouter.post('/add', async (req, res) => {
  const { productId, quantity = 1, customization, designFile } = req.body;
  const product = await Product.findById(productId);
  if (!product || product.status !== 'active') return res.status(404).json({ success: false, message: 'Product not found' });
  if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock' });

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

// Update quantity
cartRouter.put('/item/:itemId', async (req, res) => {
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

// Remove item
cartRouter.delete('/item/:itemId', async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
  cart.items.pull({ _id: req.params.itemId });
  await cart.save();
  res.json({ success: true, message: 'Item removed', data: { cart } });
});

// Apply coupon
cartRouter.post('/coupon', async (req, res) => {
  const { code } = req.body;
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon || !coupon.isValid()) return res.status(400).json({ success: false, message: 'Invalid or expired coupon' });

  const discount = coupon.calculateDiscount(cart.subtotal);
  cart.coupon = coupon._id;
  cart.couponDiscount = discount;
  await cart.save();

  res.json({ success: true, message: `Coupon applied! You save ₹${discount}`, data: { discount, cart } });
});

// Remove coupon
cartRouter.delete('/coupon', async (req, res) => {
  const cart = await Cart.findOneAndUpdate({ user: req.user.id }, { coupon: null, couponDiscount: 0 }, { new: true });
  res.json({ success: true, message: 'Coupon removed', data: { cart } });
});

// Clear cart
cartRouter.delete('/', async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user.id }, { items: [], coupon: null, couponDiscount: 0 });
  res.json({ success: true, message: 'Cart cleared' });
});

module.exports = cartRouter;

// ══════════════════════════════════════════
// routes/payment.routes.js
// ══════════════════════════════════════════
const paymentExpress = require('express');
const paymentRouter = paymentExpress.Router();
const paymentAuth = require('../middlewares/auth.middleware');
const { createRazorpayOrder, verifyPayment } = require('../controllers/order.controller');

paymentRouter.post('/razorpay/create', paymentAuth.protect, createRazorpayOrder);
paymentRouter.post('/razorpay/verify', paymentAuth.protect, verifyPayment);

module.exports = paymentRouter;
