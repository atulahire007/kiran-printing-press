const express = require('express');
const router = express.Router();
const {
  placeOrder, createRazorpayOrder, verifyPayment, getMyOrders,
  getOrderById, cancelOrder, downloadInvoice,
  adminUpdateOrderStatus, adminGetAllOrders,
} = require('../controllers/order.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.post('/', placeOrder);
router.post('/razorpay/create', createRazorpayOrder);
router.post('/razorpay/verify', verifyPayment);
router.get('/my-orders', getMyOrders);
router.get('/admin/all', authorize('admin', 'superadmin'), adminGetAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.get('/:id/invoice', downloadInvoice);
router.put('/:id/status', authorize('admin', 'superadmin'), adminUpdateOrderStatus);
module.exports = router;
