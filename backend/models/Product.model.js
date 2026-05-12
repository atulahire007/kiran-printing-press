const mongoose = require('mongoose');
const slugify = require('slugify');

const variationSchema = new mongoose.Schema({
  name: { type: String, required: true },       // e.g., "Size", "Material", "Finish"
  options: [{
    label: { type: String, required: true },    // e.g., "A4", "Glossy"
    priceModifier: { type: Number, default: 0 }, // +/- price
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
  // Multilingual names
  nameHi: { type: String, trim: true },   // Hindi
  nameMr: { type: String, trim: true },   // Marathi

  slug: { type: String, unique: true, lowercase: true },

  description: {
    type: String,
    required: [true, 'Product description is required'],
  },
  descriptionHi: { type: String },  // Hindi description
  descriptionMr: { type: String },  // Marathi description
  shortDescription: { type: String, maxlength: 300 },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },

  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },

  images: [{
    public_id: { type: String, required: true },
    url: { type: String, required: true },
    alt: { type: String },
    isPrimary: { type: Boolean, default: false },
  }],

  // Pricing
  basePrice: { type: Number, required: [true, 'Base price is required'], min: 0 },
  discountPrice: { type: Number, min: 0 },
  discountPercent: { type: Number, min: 0, max: 100 },

  // GST
  gstRate: { type: Number, enum: [0, 5, 12, 18, 28], default: 18 },
  hsnCode: { type: String },

  // Bulk pricing tiers
  pricingTiers: [pricingTierSchema],

  // Variations (size, material, finish, lamination, etc.)
  variations: [variationSchema],

  // Printing-specific
  printingOptions: {
    paperSizes: [String],       // ['A4', 'A5', 'A3', 'Business Card', 'Custom']
    paperWeights: [String],     // ['90gsm', '130gsm', '300gsm']
    colorOptions: [String],     // ['4-Color', 'Black & White', 'Spot Color']
    finishOptions: [String],    // ['Matte', 'Glossy', 'Soft Touch']
    laminationOptions: [String],// ['No Lamination', 'Gloss Lamination', 'Matte Lamination']
    allowCustomSize: { type: Boolean, default: false },
    requiresDesignUpload: { type: Boolean, default: false },
    turnaroundTime: { type: String }, // e.g., "2-3 business days"
  },

  // Stock
  stock: { type: Number, default: 100 },
  minOrderQty: { type: Number, default: 1 },
  maxOrderQty: { type: Number, default: 10000 },
  unit: { type: String, default: 'piece', enum: ['piece', 'set', 'box', 'kg', 'sqft', 'meter'] },

  // SEO
  metaTitle: { type: String, maxlength: 70 },
  metaDescription: { type: String, maxlength: 160 },
  metaTitleHi: { type: String },
  metaTitleMr: { type: String },
  tags: [{ type: String, lowercase: true, trim: true }],

  // Status
  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'active' },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },

  // Ratings
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  totalSold: { type: Number, default: 0 },

  // Delivery
  estimatedDelivery: { type: String, default: '3-5 business days' },
  deliveryWeight: { type: Number }, // in grams (for shipping calc)

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ── Indexes ────────────────────────────────
productSchema.index({ slug: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ name: 'text', tags: 'text', description: 'text' });
productSchema.index({ basePrice: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ totalSold: -1 });
productSchema.index({ isFeatured: 1, status: 1 });

// ── Pre-save: Generate slug & SKU ──────────
productSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now().toString().slice(-5);
  }
  // Auto-calculate discount percent
  if (this.discountPrice && this.basePrice) {
    this.discountPercent = Math.round(((this.basePrice - this.discountPrice) / this.basePrice) * 100);
  }
  next();
});

// ── Virtuals ───────────────────────────────
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

// ── Price for a given quantity ─────────────
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
