// ══════════════════════════════════════════
// routes/auth.routes.js
// ══════════════════════════════════════════
const express = require('express');
const router = express.Router();
const {
  register, login, logout, getMe, updateProfile, updatePassword,
  forgotPassword, resetPassword, verifyEmail, sendOTP, verifyOTP,
  googleAuth, addAddress, updateAddress, deleteAddress,
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/me/password', protect, updatePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/google', googleAuth);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

module.exports = router;
