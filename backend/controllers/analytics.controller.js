const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const User = require('../models/User.model');
const { Review } = require('../models/index');

// ── DASHBOARD OVERVIEW ───────────────────────
exports.getDashboardStats = async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const [
    totalOrders, todayOrders, monthOrders,
    totalRevenue, monthRevenue, todayRevenue,
    totalUsers, newUsersToday, newUsersMonth,
    totalProducts, pendingOrders, processingOrders,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfDay } }),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),

    Order.aggregate([{ $match: { paymentStatus: 'completed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Order.aggregate([{ $match: { paymentStatus: 'completed', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Order.aggregate([{ $match: { paymentStatus: 'completed', createdAt: { $gte: startOfDay } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),

    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', createdAt: { $gte: startOfDay } }),
    User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),

    Product.countDocuments({ status: 'active' }),
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({ status: { $in: ['confirmed', 'designing', 'printing'] } }),

    Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        orders: { total: totalOrders, today: todayOrders, month: monthOrders, pending: pendingOrders, processing: processingOrders },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          month: monthRevenue[0]?.total || 0,
          today: todayRevenue[0]?.total || 0,
        },
        users: { total: totalUsers, newToday: newUsersToday, newThisMonth: newUsersMonth },
        products: { active: totalProducts },
      },
      recentOrders,
    },
  });
};

// ── SALES CHART (Last 12 months) ─────────────
exports.getSalesChart = async (req, res) => {
  const { period = 'monthly' } = req.query;
  const now = new Date();

  let groupBy, startDate;
  if (period === 'daily') {
    startDate = new Date(now.setDate(now.getDate() - 30));
    groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
  } else if (period === 'weekly') {
    startDate = new Date(now.setDate(now.getDate() - 84));
    groupBy = { year: { $year: '$createdAt' }, week: { $isoWeek: '$createdAt' } };
  } else {
    startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
  }

  const data = await Order.aggregate([
    { $match: { paymentStatus: 'completed', createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
  ]);

  res.status(200).json({ success: true, data: { chart: data, period } });
};

// ── TOP PRODUCTS ─────────────────────────────
exports.getTopProducts = async (req, res) => {
  const { limit = 10 } = req.query;

  const topProducts = await Product.find({ status: 'active' })
    .sort({ totalSold: -1 })
    .limit(parseInt(limit))
    .select('name images totalSold basePrice averageRating category')
    .populate('category', 'name')
    .lean();

  res.status(200).json({ success: true, data: { products: topProducts } });
};

// ── ORDER STATUS DISTRIBUTION ────────────────
exports.getOrderStatusDistribution = async (req, res) => {
  const distribution = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.status(200).json({ success: true, data: { distribution } });
};

// ── CUSTOMER GROWTH ──────────────────────────
exports.getCustomerGrowth = async (req, res) => {
  const sixMonthsAgo = new Date(new Date().setMonth(new Date().getMonth() - 6));

  const growth = await User.aggregate([
    { $match: { role: 'user', createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        newUsers: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.status(200).json({ success: true, data: { growth } });
};

// ── REVENUE BY CATEGORY ──────────────────────
exports.getRevenueByCategory = async (req, res) => {
  const data = await Order.aggregate([
    { $match: { paymentStatus: 'completed' } },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    { $unwind: '$productInfo' },
    {
      $lookup: {
        from: 'categories',
        localField: 'productInfo.category',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    { $unwind: '$categoryInfo' },
    {
      $group: {
        _id: '$categoryInfo._id',
        categoryName: { $first: '$categoryInfo.name' },
        revenue: { $sum: '$items.totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
  ]);

  res.status(200).json({ success: true, data: { categories: data } });
};
