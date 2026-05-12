// utils/invoice.js - Simple HTML-to-PDF invoice generator
// In production, use puppeteer or pdfkit for proper PDF generation

exports.generateInvoicePDF = async (order) => {
  // Using a simple approach - in production use puppeteer or PDFKit
  // npm install pdfkit
  try {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).fillColor('#DC2626').text('KIRAN PRINTING PRESS', { align: 'center' });
      doc.fontSize(10).fillColor('#666').text('Dharashiv, Maharashtra - 413501', { align: 'center' });
      doc.text(`GST: ${process.env.BUSINESS_GST || 'GSTIN'}`, { align: 'center' });
      doc.moveDown();

      doc.fontSize(16).fillColor('#000').text('TAX INVOICE', { align: 'center' });
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      // Order details
      doc.fontSize(10);
      doc.text(`Invoice No: INV-${order.orderNumber}`);
      doc.text(`Order No: ${order.orderNumber}`);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`);
      doc.moveDown();

      // Customer details
      if (order.shippingAddress) {
        doc.text('Bill To:', { underline: true });
        const addr = order.shippingAddress;
        doc.text(`${addr.name}`);
        doc.text(`${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}`);
        doc.text(`${addr.city}, ${addr.state} - ${addr.pincode}`);
        doc.text(`Mobile: ${addr.mobile}`);
      }
      doc.moveDown();

      // Items table
      doc.text('Items:', { underline: true });
      doc.moveDown(0.3);

      // Table header
      doc.fillColor('#f3f4f6').rect(50, doc.y, 495, 20).fill();
      doc.fillColor('#000');
      const tableY = doc.y;
      doc.text('Product', 55, tableY + 5, { width: 200 });
      doc.text('Qty', 260, tableY + 5, { width: 60 });
      doc.text('Unit Price', 325, tableY + 5, { width: 90 });
      doc.text('Total', 420, tableY + 5, { width: 80 });
      doc.moveDown(1.2);

      order.items.forEach(item => {
        doc.text(item.name, 55, doc.y, { width: 200 });
        doc.text(item.quantity.toString(), 260, doc.y - 12, { width: 60 });
        doc.text(`₹${item.unitPrice.toFixed(2)}`, 325, doc.y - 12, { width: 90 });
        doc.text(`₹${item.totalPrice.toFixed(2)}`, 420, doc.y - 12, { width: 80 });
        doc.moveDown(0.3);
      });

      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      // Totals
      const totalsX = 350;
      doc.text('Subtotal:', totalsX);
      doc.text(`₹${order.subtotal.toFixed(2)}`, 460, doc.y - 12);
      if (order.couponDiscount > 0) {
        doc.text('Coupon Discount:', totalsX);
        doc.text(`-₹${order.couponDiscount.toFixed(2)}`, 460, doc.y - 12);
      }
      doc.text('GST:', totalsX);
      doc.text(`₹${order.gstTotal.toFixed(2)}`, 460, doc.y - 12);
      doc.text('Shipping:', totalsX);
      doc.text(`₹${order.shippingCharge.toFixed(2)}`, 460, doc.y - 12);
      doc.fontSize(12).text('Total Amount:', totalsX);
      doc.text(`₹${order.totalAmount.toFixed(2)}`, 460, doc.y - 14);

      // Footer
      doc.moveDown(2);
      doc.fontSize(9).fillColor('#666');
      doc.text('Thank you for choosing Kiran Printing Press!', { align: 'center' });
      doc.text('For any queries: WhatsApp +91 98765 43210 | Email: kiranprinting@gmail.com', { align: 'center' });

      doc.end();
    });
  } catch (err) {
    // PDFKit not available, return placeholder
    return Buffer.from(`Invoice for Order: ${order.orderNumber}\nTotal: ₹${order.totalAmount}`);
  }
};
