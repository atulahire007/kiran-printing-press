const mongoose = require('mongoose');
const slugify = require('slugify');

// ══════════════════════════════════════════
// CATEGORY MODEL
// ══════════════════════════════════════════
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  nameHi: { type: String, trim: true },
  nameMr: { type: String, trim: true },
  slug: { type: String, unique: true, lowercase: true }, // unique creates index already
  description: { type: String },
  image: { public_id: String, url: String },
  icon: { type: String },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  metaTitle: { type: String },
  metaDescription: { type: String },
  productCount: { type: Number, default: 0 },
}, { timestamps: true });

categorySchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// DO NOT add categorySchema.index({ slug:1 }) — already unique:true above
categorySchema.virtual('products', { ref: 'Product', localField: '_id', foreignField: 'category' });
const Category = mongoose.model('Category', categorySchema);

// ══════════════════════════════════════════
// CART MODEL
// ══════════════════════════════════════════
const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  customization: {
    paperSize: String,
    paperWeight: String,
    colorOption: String,
    finish: String,
    lamination: String,
    selectedVariations: [{ name: String, option: String, priceModifier: Number }],
    specialInstructions: String,
  },
  designFile: { public_id: String, url: String, fileName: String },
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema],
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
  couponDiscount: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
});
cartSchema.virtual('itemCount').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});
const Cart = mongoose.model('Cart', cartSchema);

// ══════════════════════════════════════════
// COUPON MODEL
// ══════════════════════════════════════════
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true }, // unique creates index
  description: { type: String },
  discountType: { type: String, enum: ['percentage', 'flat'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  maxDiscountAmount: { type: Number },
  minOrderValue: { type: Number, default: 0 },
  usageLimit: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  perUserLimit: { type: Number, default: 1 },
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  isFirstOrder: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  usedBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, usedAt: Date }],
}, { timestamps: true });

// DO NOT add couponSchema.index({ code:1 }) — already unique:true above
couponSchema.index({ isActive: 1, endDate: 1 });

couponSchema.methods.isValid = function () {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate
    && (this.usageLimit === null || this.usedCount < this.usageLimit);
};

couponSchema.methods.calculateDiscount = function (orderValue) {
  if (!this.isValid() || orderValue < this.minOrderValue) return 0;
  if (this.discountType === 'flat') return Math.min(this.discountValue, orderValue);
  const discount = (orderValue * this.discountValue) / 100;
  return this.maxDiscountAmount ? Math.min(discount, this.maxDiscountAmount) : discount;
};
const Coupon = mongoose.model('Coupon', couponSchema);

// ══════════════════════════════════════════
// REVIEW MODEL
// ══════════════════════════════════════════
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, maxlength: 100 },
  comment: { type: String, required: true, maxlength: 1000 },
  images: [{ public_id: String, url: String }],
  isApproved: { type: Boolean, default: false },
  isVerifiedPurchase: { type: Boolean, default: false },
  helpfulVotes: { type: Number, default: 0 },
  adminReply: { type: String },
  adminRepliedAt: { type: Date },
}, { timestamps: true });

reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, isApproved: 1 });

reviewSchema.statics.updateProductRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const Product = mongoose.model('Product');
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { averageRating: 0, numReviews: 0 });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.updateProductRating(this.product);
});
reviewSchema.post('remove', async function () {
  await this.constructor.updateProductRating(this.product);
});
const Review = mongoose.model('Review', reviewSchema);

// ══════════════════════════════════════════
// BANNER MODEL
// ══════════════════════════════════════════
const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleHi: String,
  titleMr: String,
  subtitle: String,
  subtitleHi: String,
  subtitleMr: String,
  image: { public_id: { type: String }, url: { type: String } },
  mobileImage: { public_id: String, url: String },
  link: { type: String },
  buttonText: { type: String, default: 'Shop Now' },
  buttonTextHi: String,
  buttonTextMr: String,
  position: { type: String, enum: ['hero', 'middle', 'bottom', 'sidebar', 'popup'], default: 'hero' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  startDate: Date,
  endDate: Date,
  clickCount: { type: Number, default: 0 },
}, { timestamps: true });

bannerSchema.index({ position: 1, isActive: 1, sortOrder: 1 });
const Banner = mongoose.model('Banner', bannerSchema);

// ══════════════════════════════════════════
// CONTACT INQUIRY MODEL
// ══════════════════════════════════════════
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  mobile: { type: String, required: true },
  subject: { type: String },
  message: { type: String, required: true },
  inquiryType: {
    type: String,
    enum: ['general', 'bulk_order', 'design_help', 'complaint', 'quotation'],
    default: 'general',
  },
  status: { type: String, enum: ['new', 'in_progress', 'resolved', 'closed'], default: 'new' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminNotes: String,
  repliedAt: Date,
  source: { type: String, enum: ['website', 'whatsapp', 'phone'], default: 'website' },
}, { timestamps: true });
const Contact = mongoose.model('Contact', contactSchema);

// ══════════════════════════════════════════
// TESTIMONIAL MODEL
// ══════════════════════════════════════════
const testimonialSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhoto: { public_id: String, url: String },
  designation: String,
  company: String,
  rating: { type: Number, min: 1, max: 5, default: 5 },
  testimonial: { type: String, required: true },
  testimonialHi: String,
  testimonialMr: String,
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });
const Testimonial = mongoose.model('Testimonial', testimonialSchema);

// ══════════════════════════════════════════
// DESIGN FILE MODEL
// ══════════════════════════════════════════
const designFileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  public_id: { type: String, required: true },
  url: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: Number,
  fileType: String,
  mimeType: String,
  status: { type: String, enum: ['uploaded', 'under_review', 'approved', 'rejected'], default: 'uploaded' },
  adminFeedback: String,
}, { timestamps: true });
const DesignFile = mongoose.model('DesignFile', designFileSchema);

// ══════════════════════════════════════════
// NOTIFICATION MODEL
// ══════════════════════════════════════════
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['order_update', 'payment', 'promotion', 'design_feedback', 'review', 'system'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  actionUrl: String,
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = {
  Category, Cart, Coupon, Review, Banner,
  Contact, Testimonial, DesignFile, Notification
};
