/**
 * Invoice PDF Generator
 * Generates a simple text-based invoice buffer
 * For production: install pdfkit and use the full PDF version
 */

exports.generateInvoicePDF = async (order) => {
  // Simple HTML invoice as buffer (works without pdfkit)
  const addr = order.shippingAddress || {};
  const items = (order.items || []).map(item =>
    `  - ${item.name} x${item.quantity}  @ Rs.${item.unitPrice}  = Rs.${item.totalPrice}`
  ).join('\n');

  const invoiceText = `
=====================================
       KIRAN PRINTING PRESS
   Dharashiv, Maharashtra - 413501
   Tel: +91 98765 43210
   GSTIN: ${process.env.BUSINESS_GST || 'N/A'}
=====================================

INVOICE: INV-${order.orderNumber}
ORDER:   ${order.orderNumber}
DATE:    ${new Date(order.createdAt).toLocaleDateString('en-IN')}

BILL TO:
  ${addr.name || ''}
  ${addr.addressLine1 || ''}
  ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}
  Mobile: ${addr.mobile || ''}

ITEMS:
${items}

-------------------------------------
Subtotal:         Rs. ${(order.subtotal || 0).toFixed(2)}
GST:              Rs. ${(order.gstTotal || 0).toFixed(2)}
Shipping:         Rs. ${(order.shippingCharge || 0).toFixed(2)}
${order.couponDiscount > 0 ? `Coupon Discount:  -Rs. ${order.couponDiscount.toFixed(2)}\n` : ''}TOTAL:            Rs. ${(order.totalAmount || 0).toFixed(2)}
=====================================
Payment: ${(order.paymentMethod || '').toUpperCase()}
Status:  ${(order.paymentStatus || '').toUpperCase()}
=====================================
Thank you for choosing Kiran Printing Press!
WhatsApp: ${process.env.WHATSAPP_NUMBER || '+91 98765 43210'}
=====================================
`.trim();

  return Buffer.from(invoiceText, 'utf-8');
};
