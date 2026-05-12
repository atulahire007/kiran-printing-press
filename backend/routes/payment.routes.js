const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { createRazorpayOrder, verifyPayment } = require('../controllers/order.controller');
router.post('/razorpay/create', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyPayment);
module.exports = router;
