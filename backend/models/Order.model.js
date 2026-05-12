const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  sku: { type: String },
  image: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },

  // Printing customization
  customization: {
    paperSize: String,
    paperWeight: String,
    colorOption: String,
    finish: String,
    lamination: String,
    selectedVariations: [{
      name: String,
      option: String,
      priceModifier: Number,
    }],
    specialInstructions: String,
  },

  // Uploaded design file
  designFile: {
    public_id: String,
    url: String,
    fileName: String,
    fileType: String,
    uploadedAt: Date,
  },

  // GST
  gstRate: { type: Number, default: 18 },
  gstAmount: { type: Number, default: 0 },
}, { _id: true });

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'designing', 'printing', 'ready', 'shipped', 'delivered', 'cancelled', 'refunded'],
    required: true,
  },
  message: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  items: [orderItemSchema],

  // Address snapshot
  shippingAddress: {
    name: String,
    mobile: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    district: String,
    state: String,
    pincode: String,
    landmark: String,
  },

  // Pricing breakdown
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  couponCode: { type: String },
  couponDiscount: { type: Number, default: 0 },
  shippingCharge: { type: Number, default: 0 },
  gstTotal: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },

  // Payment
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'upi', 'cod', 'wallet'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentDetails: {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
    paidAt: Date,
  },

  // Order status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'designing', 'printing', 'ready', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },

  // Status timeline
  statusHistory: [statusHistorySchema],

  // Delivery
  trackingNumber: String,
  courierPartner: String,
  estimatedDelivery: Date,
  deliveredAt: Date,

  // Notes
  customerNotes: String,
  adminNotes: String,

  // Invoice
  invoiceNumber: String,
  invoiceGeneratedAt: Date,

  // Cancellation
  cancelledAt: Date,
  cancellationReason: String,
  cancelledBy: { type: String, enum: ['user', 'admin'] },

  // Loyalty points
  loyaltyPointsEarned: { type: Number, default: 0 },
  loyaltyPointsUsed: { type: Number, default: 0 },

  // Source
  source: { type: String, enum: ['website', 'whatsapp', 'phone', 'walkin'], default: 'website' },

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ── Indexes ────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'paymentDetails.razorpay_order_id': 1 });
orderSchema.index({ createdAt: -1 });

// ── Pre-save: Generate order number ────────
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    const date = new Date();
    this.orderNumber = `KPP-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(count + 1).padStart(5, '0')}`;

    // Initialize status history
    this.statusHistory = [{
      status: 'pending',
      message: 'Order placed successfully',
      timestamp: new Date(),
    }];
  }
  next();
});

// ── Methods ────────────────────────────────
orderSchema.methods.updateStatus = async function (status, message, updatedBy) {
  this.status = status;
  this.statusHistory.push({ status, message, updatedBy, timestamp: new Date() });
  if (status === 'delivered') this.deliveredAt = new Date();
  if (status === 'cancelled') this.cancelledAt = new Date();
  return await this.save();
};

// ── Virtuals ───────────────────────────────
orderSchema.virtual('isDelivered').get(function () {
  return this.status === 'delivered';
});

orderSchema.virtual('canBeCancelled').get(function () {
  return ['pending', 'confirmed'].includes(this.status);
});

module.exports = mongoose.model('Order', orderSchema);
