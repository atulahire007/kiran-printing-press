const express = require('express');
const router = express.Router();
const { Contact } = require('../models/index');
const { sendEmail } = require('../utils/email');

router.post('/', async (req, res) => {
  const contact = await Contact.create(req.body);
  try {
    await sendEmail({
      to: process.env.FROM_EMAIL,
      subject: `New Inquiry from ${req.body.name} - ${req.body.inquiryType || 'General'}`,
      html: `<p>Name: ${req.body.name}</p><p>Mobile: ${req.body.mobile}</p><p>Message: ${req.body.message}</p>`,
    });
  } catch {}
  res.status(201).json({ success: true, message: 'Message sent! We will get back to you soon.', data: { contact } });
});

router.get('/banners', async (req, res) => {
  const { Banner } = require('../models/index');
  const position = req.query.position || 'hero';
  const banners = await Banner.find({ isActive: true, position }).sort({ sortOrder: 1 });
  res.json({ success: true, data: { banners } });
});

module.exports = router;
