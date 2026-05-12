const express = require('express');
const router = express.Router();
const { Notification } = require('../models/index');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/', async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20);
  const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });
  res.json({ success: true, data: { notifications, unreadCount } });
});

router.put('/read-all', async (req, res) => {
  await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true, readAt: new Date() });
  res.json({ success: true, message: 'All marked as read' });
});

router.put('/:id/read', async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() });
  res.json({ success: true });
});

module.exports = router;
