const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true, default: 'Maharashtra' },
  pincode: { type: String, required: true },
  landmark: { type: String },
  addressType: { type: String, enum: ['home', 'office', 'other'], default: 'home' },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [60, 'Name cannot exceed 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Invalid email address'],
  },
  mobile: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Invalid Indian mobile number'],
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  avatar: {
    public_id: String,
    url: { type: String, default: 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png' },
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user',
  },
  isVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },

  // OAuth
  googleId: { type: String, select: false },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },

  // Addresses
  addresses: [addressSchema],

  // OTP for mobile login
  otp: { type: String, select: false },
  otpExpiry: { type: Date, select: false },

  // Email verification
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpiry: { type: Date, select: false },

  // Password reset
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpiry: { type: Date, select: false },

  // Loyalty & referral
  loyaltyPoints: { type: Number, default: 0 },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Preferences
  preferredLanguage: { type: String, enum: ['en', 'hi', 'mr'], default: 'en' },
  newsletterSubscribed: { type: Boolean, default: true },

  // Activity tracking
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },

  // Wishlist (product IDs)
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ── Indexes ────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ mobile: 1 });
userSchema.index({ referralCode: 1 });

// ── Pre-save: Hash password ────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  // Generate referral code
  if (!this.referralCode) {
    this.referralCode = `KPP${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

// ── Methods ────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
  return resetToken;
};

userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

// ── Virtuals ───────────────────────────────
userSchema.virtual('fullAddress').get(function () {
  const def = this.addresses?.find(a => a.isDefault);
  return def ? `${def.addressLine1}, ${def.city}, ${def.state} - ${def.pincode}` : '';
});

module.exports = mongoose.model('User', userSchema);
