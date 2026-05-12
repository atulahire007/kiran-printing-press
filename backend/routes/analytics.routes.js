const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
  getDashboardStats, getSalesChart, getTopProducts,
  getOrderStatusDistribution, getCustomerGrowth, getRevenueByCategory,
} = require('../controllers/analytics.controller');

router.use(protect, authorize('admin', 'superadmin'));
router.get('/dashboard', getDashboardStats);
router.get('/sales-chart', getSalesChart);
router.get('/top-products', getTopProducts);
router.get('/order-status', getOrderStatusDistribution);
router.get('/customer-growth', getCustomerGrowth);
router.get('/revenue-by-category', getRevenueByCategory);

module.exports = router;
