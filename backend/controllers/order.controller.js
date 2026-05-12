const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const { Cart, Coupon, Notification } = require('../models/index');
const User = require('../models/User.model');
const ErrorResponse = require('../utils/ErrorResponse');
const { generateInvoicePDF } = require('../utils/invoice');
const { sendEmail } = require('../utils/email');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── PLACE ORDER ──────────────────────────────
exports.placeOrder = async (req, res) => {
  const {
    items,
    shippingAddress,
    paymentMethod,
    couponCode,
    customerNotes,
    loyaltyPointsToUse = 0,
  } = req.body;

  // Validate items and fetch current prices
  const orderItems = [];
  let subtotal = 0;
  let gstTotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) throw new ErrorResponse(`Product not found: ${item.product}`, 404);
    if (product.status !== 'active') throw new ErrorResponse(`${product.name} is not available`, 400);
    if (product.stock < item.quantity) throw new ErrorResponse(`Insufficient stock for ${product.name}`, 400);

    const unitPrice = product.getPriceForQty(item.quantity);
    const itemTotal = unitPrice * item.quantity;
    const gstAmount = (itemTotal * product.gstRate) / 100;

    orderItems.push({
      product: product._id,
      name: product.name,
      sku: product.sku,
      image: product.primaryImage?.url,
      quantity: item.quantity,
      unitPrice,
      totalPrice: itemTotal,
      customization: item.customization,
      designFile: item.designFile,
      gstRate: product.gstRate,
      gstAmount,
    });

    subtotal += itemTotal;
    gstTotal += gstAmount;

    // Deduct stock
    await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity, totalSold: item.quantity } });
  }

  // Coupon discount
  let couponDiscount = 0;
  let appliedCoupon = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon?.isValid()) {
      couponDiscount = coupon.calculateDiscount(subtotal);
      appliedCoupon = coupon.code;
      // Track usage
      coupon.usedCount += 1;
      coupon.usedBy.push({ user: req.user.id, usedAt: new Date() });
      await coupon.save();
    }
  }

  // Loyalty points
  const user = await User.findById(req.user.id);
  let loyaltyDiscount = 0;
  if (loyaltyPointsToUse > 0 && user.loyaltyPoints >= loyaltyPointsToUse) {
    loyaltyDiscount = loyaltyPointsToUse * 0.1; // 1 point = ₹0.10
    user.loyaltyPoints -= loyaltyPointsToUse;
  }

  // Shipping charge
  const shippingCharge = subtotal > 499 ? 0 : 49;

  // Total
  const totalAmount = Math.max(0, subtotal + gstTotal + shippingCharge - couponDiscount - loyaltyDiscount);

  // Loyalty points earned (1 point per ₹10 spent)
  const loyaltyPointsEarned = Math.floor(totalAmount / 10);
  user.loyaltyPoints += loyaltyPointsEarned;
  await user.save({ validateBeforeSave: false });

  const orderData = {
    user: req.user.id,
    items: orderItems,
    shippingAddress,
    subtotal,
    couponCode: appliedCoupon,
    couponDiscount,
    shippingCharge,
    gstTotal,
    totalAmount,
    paymentMethod,
    customerNotes,
    loyaltyPointsEarned,
    loyaltyPointsUsed: loyaltyPointsToUse,
  };

  const order = await Order.create(orderData);

  // Clear cart
  await Cart.findOneAndUpdate({ user: req.user.id }, { items: [], coupon: null, couponDiscount: 0 });

  // Send order confirmation email
  try {
    await sendEmail({
      to: user.email,
      subject: `Order Confirmed - ${order.orderNumber} | Kiran Printing Press`,
      template: 'orderConfirmation',
      data: { name: user.name, order },
    });
  } catch (err) {
    console.error('Order email failed:', err.message);
  }

  // Create notification
  await Notification.create({
    user: req.user.id,
    type: 'order_update',
    title: 'Order Placed Successfully!',
    message: `Your order ${order.orderNumber} has been placed. We'll confirm it shortly.`,
    data: { orderId: order._id, orderNumber: order.orderNumber },
    actionUrl: `/orders/${order._id}`,
  });

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: { order },
  });
};

// ── CREATE RAZORPAY ORDER ────────────────────
exports.createRazorpayOrder = async (req, res) => {
  const { amount, orderId } = req.body;

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100), // paise
    currency: 'INR',
    receipt: orderId || `receipt_${Date.now()}`,
    notes: {
      business: 'Kiran Printing Press',
      city: 'Dharashiv',
    },
  });

  res.status(200).json({
    success: true,
    data: {
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    },
  });
};

// ── VERIFY PAYMENT ───────────────────────────
exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const expectedSig = hmac.digest('hex');

  if (expectedSig !== razorpay_signature) {
    throw new ErrorResponse('Invalid payment signature', 400);
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      paymentStatus: 'completed',
      'paymentDetails.razorpay_order_id': razorpay_order_id,
      'paymentDetails.razorpay_payment_id': razorpay_payment_id,
      'paymentDetails.razorpay_signature': razorpay_signature,
      'paymentDetails.paidAt': new Date(),
      status: 'confirmed',
    },
    { new: true }
  );

  order.statusHistory.push({ status: 'confirmed', message: 'Payment received. Order confirmed.', timestamp: new Date() });
  await order.save();

  res.status(200).json({ success: true, message: 'Payment verified successfully', data: { order } });
};

// ── GET MY ORDERS ────────────────────────────
exports.getMyOrders = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = { user: req.user.id };
  if (status) query.status = status;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean(),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    },
  });
};

// ── GET ORDER DETAILS ────────────────────────
exports.getOrderById = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
    .populate('items.product', 'name images slug');

  if (!order) throw new ErrorResponse('Order not found', 404);
  res.status(200).json({ success: true, data: { order } });
};

// ── CANCEL ORDER ─────────────────────────────
exports.cancelOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) throw new ErrorResponse('Order not found', 404);
  if (!order.canBeCancelled) throw new ErrorResponse('Order cannot be cancelled at this stage', 400);

  const { reason } = req.body;
  await order.updateStatus('cancelled', reason || 'Cancelled by customer', req.user.id);

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, totalSold: -item.quantity }
    });
  }

  res.status(200).json({ success: true, message: 'Order cancelled successfully', data: { order } });
};

// ── DOWNLOAD INVOICE ─────────────────────────
exports.downloadInvoice = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
    .populate('user', 'name email mobile')
    .populate('items.product', 'name sku hsnCode');

  if (!order) throw new ErrorResponse('Order not found', 404);
  if (order.paymentStatus !== 'completed') throw new ErrorResponse('Invoice available only for paid orders', 400);

  const pdfBuffer = await generateInvoicePDF(order);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="Invoice-${order.orderNumber}.pdf"`,
    'Content-Length': pdfBuffer.length,
  });
  res.end(pdfBuffer);
};

// ── ADMIN: UPDATE ORDER STATUS ───────────────
exports.adminUpdateOrderStatus = async (req, res) => {
  const { status, message, trackingNumber, courierPartner } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ErrorResponse('Order not found', 404);

  await order.updateStatus(status, message, req.user.id);
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (courierPartner) order.courierPartner = courierPartner;
  await order.save();

  // Notify customer
  const user = await User.findById(order.user);
  if (user) {
    await Notification.create({
      user: order.user,
      type: 'order_update',
      title: `Order ${order.orderNumber} - ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: message || `Your order status has been updated to ${status}.`,
      data: { orderId: order._id, orderNumber: order.orderNumber },
      actionUrl: `/orders/${order._id}`,
    });

    await sendEmail({
      to: user.email,
      subject: `Order Update - ${order.orderNumber} | Kiran Printing Press`,
      template: 'orderUpdate',
      data: { name: user.name, order, status, message },
    });
  }

  res.status(200).json({ success: true, message: 'Order status updated', data: { order } });
};

// ── ADMIN: GET ALL ORDERS ────────────────────
exports.adminGetAllOrders = async (req, res) => {
  const { page = 1, limit = 20, status, paymentStatus, startDate, endDate, search } = req.query;
  const query = {};

  if (status) query.status = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  if (search) query.orderNumber = { $regex: search, $options: 'i' };

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email mobile')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean(),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: { orders, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } },
  });
};
