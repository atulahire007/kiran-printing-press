const User = require('../models/User.model');
const Order = require('../models/Order.model');
const { Testimonial, Banner, Contact, Notification } = require('../models/index');
const ErrorResponse = require('../utils/ErrorResponse');

// ── GET ALL USERS ────────────────────────────
exports.getAllUsers = async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -otp -otpExpiry -resetPasswordToken -emailVerificationToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments(query),
  ]);

  // Enrich with order counts
  const enriched = await Promise.all(users.map(async (u) => {
    const orderCount = await Order.countDocuments({ user: u._id });
    return { ...u, orderCount };
  }));

  res.status(200).json({
    success: true,
    data: {
      users: enriched,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    },
  });
};

// ── BLOCK / UNBLOCK USER ─────────────────────
exports.toggleUserBlock = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ErrorResponse('User not found', 404);
  if (user.role === 'superadmin') throw new ErrorResponse('Cannot block a superadmin', 403);

  user.isBlocked = req.body.isBlocked;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: user.isBlocked ? 'User blocked' : 'User unblocked',
    data: { user },
  });
};

// ── GET USER DETAIL ──────────────────────────
exports.getUserDetail = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) throw new ErrorResponse('User not found', 404);
  const orders = await Order.find({ user: user._id })
    .sort({ createdAt: -1 }).limit(10).select('orderNumber totalAmount status createdAt');
  res.status(200).json({ success: true, data: { user, orders } });
};

// ── TESTIMONIAL CRUD ─────────────────────────
exports.getTestimonials = async (req, res) => {
  const testimonials = await Testimonial.find().sort({ sortOrder: 1, createdAt: -1 });
  res.status(200).json({ success: true, data: { testimonials } });
};

exports.createTestimonial = async (req, res) => {
  const testimonial = await Testimonial.create(req.body);
  res.status(201).json({ success: true, data: { testimonial } });
};

exports.updateTestimonial = async (req, res) => {
  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!testimonial) throw new ErrorResponse('Not found', 404);
  res.status(200).json({ success: true, data: { testimonial } });
};

exports.deleteTestimonial = async (req, res) => {
  await Testimonial.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Deleted' });
};

// ── CONTACT INQUIRIES ────────────────────────
exports.getContacts = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = status ? { status } : {};
  const [contacts, total] = await Promise.all([
    Contact.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)),
    Contact.countDocuments(query),
  ]);
  res.status(200).json({
    success: true,
    data: { contacts, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } },
  });
};

exports.updateContactStatus = async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!contact) throw new ErrorResponse('Not found', 404);
  res.status(200).json({ success: true, data: { contact } });
};

// ── BANNER CRUD ──────────────────────────────
exports.getBanners = async (req, res) => {
  const banners = await Banner.find().sort({ sortOrder: 1 });
  res.status(200).json({ success: true, data: { banners } });
};

exports.createBanner = async (req, res) => {
  const banner = await Banner.create(req.body);
  res.status(201).json({ success: true, data: { banner } });
};

exports.updateBanner = async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!banner) throw new ErrorResponse('Not found', 404);
  res.status(200).json({ success: true, data: { banner } });
};

exports.deleteBanner = async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Deleted' });
};

// ── SEND BROADCAST NOTIFICATION ──────────────
exports.sendBroadcast = async (req, res) => {
  const { title, message, type = 'promotion' } = req.body;
  const users = await User.find({ isBlocked: false }).select('_id');

  const notifications = users.map(u => ({
    user: u._id, type, title, message,
    data: { broadcast: true },
  }));

  await Notification.insertMany(notifications, { ordered: false });

  res.status(200).json({
    success: true,
    message: `Broadcast sent to ${notifications.length} users`,
  });
};
