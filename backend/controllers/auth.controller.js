const User = require('../models/User.model');
const { sendEmail } = require('../utils/email');
const { sendSMS } = require('../utils/sms');
const ErrorResponse = require('../utils/ErrorResponse');
const crypto = require('crypto');

// Helper: send token response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.generateJWT();

  const cookieOptions = {
    expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  user.password = undefined;

  res.status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token,
      data: { user },
    });
};

// ── REGISTER ────────────────────────────────
exports.register = async (req, res) => {
  const { name, email, password, mobile, preferredLanguage } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ErrorResponse('Email already registered', 400);

  const user = await User.create({ name, email, password, mobile, preferredLanguage });

  // Send verification email
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  await sendEmail({
    to: email,
    subject: 'Welcome to Kiran Printing Press - Verify Your Email',
    template: 'emailVerification',
    data: { name, verifyUrl },
  });

  sendTokenResponse(user, 201, res, 'Registration successful. Please verify your email.');
};

// ── LOGIN ────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ErrorResponse('Invalid email or password', 401);
  }
  if (user.isBlocked) throw new ErrorResponse('Your account has been blocked. Contact support.', 403);

  // Update last login
  user.lastLogin = new Date();
  user.loginCount += 1;
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'Login successful');
};

// ── LOGOUT ───────────────────────────────────
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// ── GET CURRENT USER ─────────────────────────
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist', 'name images basePrice slug');
  res.status(200).json({ success: true, data: { user } });
};

// ── UPDATE PROFILE ───────────────────────────
exports.updateProfile = async (req, res) => {
  const { name, mobile, preferredLanguage, newsletterSubscribed } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, mobile, preferredLanguage, newsletterSubscribed },
    { new: true, runValidators: true }
  );
  res.status(200).json({ success: true, data: { user } });
};

// ── UPDATE PASSWORD ──────────────────────────
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw new ErrorResponse('Current password is incorrect', 401);
  }
  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password updated successfully');
};

// ── FORGOT PASSWORD ──────────────────────────
exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new ErrorResponse('No account found with this email', 404);

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Kiran Printing Press - Password Reset Request',
    template: 'passwordReset',
    data: { name: user.name, resetUrl },
  });

  res.status(200).json({ success: true, message: 'Password reset link sent to your email' });
};

// ── RESET PASSWORD ───────────────────────────
exports.resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });
  if (!user) throw new ErrorResponse('Invalid or expired reset token', 400);

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successful');
};

// ── VERIFY EMAIL ─────────────────────────────
exports.verifyEmail = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });
  if (!user) throw new ErrorResponse('Invalid or expired verification link', 400);

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'Email verified successfully' });
};

// ── SEND OTP ─────────────────────────────────
exports.sendOTP = async (req, res) => {
  const { mobile } = req.body;
  let user = await User.findOne({ mobile });

  if (!user) {
    // Auto-create user for OTP login
    user = await User.create({ mobile, name: `User${mobile.slice(-4)}`, email: `${mobile}@temp.kiranprinting.com` });
  }

  const otp = user.generateOTP();
  await user.save({ validateBeforeSave: false });

  await sendSMS(mobile, `Your Kiran Printing Press OTP is: ${otp}. Valid for 10 minutes. Do not share.`);

  res.status(200).json({ success: true, message: 'OTP sent successfully' });
};

// ── VERIFY OTP ───────────────────────────────
exports.verifyOTP = async (req, res) => {
  const { mobile, otp } = req.body;
  const user = await User.findOne({ mobile }).select('+otp +otpExpiry');

  if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
    throw new ErrorResponse('Invalid or expired OTP', 400);
  }

  user.otp = undefined;
  user.otpExpiry = undefined;
  user.isVerified = true;
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'OTP verified successfully');
};

// ── GOOGLE AUTH CALLBACK ─────────────────────
exports.googleAuth = async (req, res) => {
  const { googleId, email, name, avatar } = req.body;

  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (!user) {
    user = await User.create({
      name, email, googleId,
      authProvider: 'google',
      isVerified: true,
      avatar: { url: avatar },
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    user.authProvider = 'google';
    await user.save({ validateBeforeSave: false });
  }

  if (user.isBlocked) throw new ErrorResponse('Your account has been blocked.', 403);

  sendTokenResponse(user, 200, res, 'Google login successful');
};

// ── MANAGE ADDRESSES ─────────────────────────
exports.addAddress = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (req.body.isDefault) {
    user.addresses.forEach(addr => { addr.isDefault = false; });
  }
  if (user.addresses.length === 0) req.body.isDefault = true;

  user.addresses.push(req.body);
  await user.save();

  res.status(201).json({ success: true, message: 'Address added', data: { addresses: user.addresses } });
};

exports.updateAddress = async (req, res) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new ErrorResponse('Address not found', 404);

  if (req.body.isDefault) {
    user.addresses.forEach(addr => { addr.isDefault = false; });
  }
  Object.assign(address, req.body);
  await user.save();

  res.status(200).json({ success: true, data: { addresses: user.addresses } });
};

exports.deleteAddress = async (req, res) => {
  const user = await User.findById(req.user.id);
  user.addresses.pull({ _id: req.params.addressId });
  await user.save();

  res.status(200).json({ success: true, message: 'Address deleted' });
};
