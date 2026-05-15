const mongoose = require('mongoose');
const slugify = require('slugify');

const variationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  options: [{
    label: { type: String, required: true },
    priceModifier: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
  }],
}, { _id: false });

const pricingTierSchema = new mongoose.Schema({
  minQty: { type: Number, required: true },
  maxQty: { type: Number },
  pricePerUnit: { type: Number, required: true },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
  },
  nameHi: { type: String, trim: true },
  nameMr: { type: String, trim: true },

  slug: { type: String, unique: true, lowercase: true }, // unique:true creates index — NO schema.index() needed

  description: { type: String, required: [true, 'Product description is required'] },
  descriptionHi: { type: String },
  descriptionMr: { type: String },
  shortDescription: { type: String, maxlength: 300 },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },

  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,   // unique:true creates index — NO schema.index() needed
    uppercase: true,
    trim: true,
  },

  images: [{
    public_id: { type: String, required: true },
    url: { type: String, required: true },
    alt: { type: String },
    isPrimary: { type: Boolean, default: false },
  }],

  basePrice: { type: Number, required: [true, 'Base price is required'], min: 0 },
  discountPrice: { type: Number, min: 0 },
  discountPercent: { type: Number, min: 0, max: 100 },

  gstRate: { type: Number, enum: [0, 5, 12, 18, 28], default: 18 },
  hsnCode: { type: String },

  pricingTiers: [pricingTierSchema],
  variations: [variationSchema],

  printingOptions: {
    paperSizes: [String],
    paperWeights: [String],
    colorOptions: [String],
    finishOptions: [String],
    laminationOptions: [String],
    allowCustomSize: { type: Boolean, default: false },
    requiresDesignUpload: { type: Boolean, default: false },
    turnaroundTime: { type: String },
  },

  stock: { type: Number, default: 100 },
  minOrderQty: { type: Number, default: 1 },
  maxOrderQty: { type: Number, default: 10000 },
  unit: { type: String, default: 'piece', enum: ['piece', 'set', 'box', 'kg', 'sqft', 'meter'] },

  metaTitle: { type: String, maxlength: 70 },
  metaDescription: { type: String, maxlength: 160 },
  metaTitleHi: { type: String },
  metaTitleMr: { type: String },
  tags: [{ type: String, lowercase: true, trim: true }],

  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'active' },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },

  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  totalSold: { type: Number, default: 0 },

  estimatedDelivery: { type: String, default: '3-5 business days' },
  deliveryWeight: { type: Number },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ── Only add indexes for fields WITHOUT unique:true in schema ──
// slug and sku already have unique:true above — do NOT re-index them
productSchema.index({ category: 1, status: 1 });
productSchema.index({ name: 'text', tags: 'text', description: 'text' });
productSchema.index({ basePrice: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ totalSold: -1 });
productSchema.index({ isFeatured: 1, status: 1 });

// ── Pre-save ────────────────────────────────
productSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now().toString().slice(-5);
  }
  if (this.discountPrice && this.basePrice) {
    this.discountPercent = Math.round(((this.basePrice - this.discountPrice) / this.basePrice) * 100);
  }
  next();
});

productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

productSchema.virtual('effectivePrice').get(function () {
  return this.discountPrice || this.basePrice;
});

productSchema.virtual('primaryImage').get(function () {
  if (!this.images?.length) return null;
  return this.images.find(img => img.isPrimary) || this.images[0];
});

productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

productSchema.methods.getPriceForQty = function (qty) {
  if (!this.pricingTiers?.length) {
    return this.discountPrice || this.basePrice;
  }
  const tier = this.pricingTiers
    .sort((a, b) => b.minQty - a.minQty)
    .find(t => qty >= t.minQty);
  return tier ? tier.pricePerUnit : (this.discountPrice || this.basePrice);
};

module.exports = mongoose.model('Product', productSchema);
