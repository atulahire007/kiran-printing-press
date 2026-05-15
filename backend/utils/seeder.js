require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const logger = require('./utils/logger');

const User = require('./models/User.model');
const Product = require('./models/Product.model');
const { Category, Banner, Testimonial, Coupon } = require('./models/index');

const CATEGORIES = [
  { name: 'Visiting Cards',    nameHi: 'विजिटिंग कार्ड',      nameMr: 'व्हिजिटिंग कार्ड',    icon: '💼', sortOrder: 1 },
  { name: 'Wedding Cards',     nameHi: 'शादी के कार्ड',        nameMr: 'लग्नपत्रिका',          icon: '💍', sortOrder: 2 },
  { name: 'Flex Printing',     nameHi: 'फ्लेक्स प्रिंटिंग',   nameMr: 'फ्लेक्स प्रिंटिंग',   icon: '🖼️', sortOrder: 3 },
  { name: 'Banner Printing',   nameHi: 'बैनर प्रिंटिंग',      nameMr: 'बॅनर प्रिंटिंग',      icon: '📢', sortOrder: 4 },
  { name: 'Pamphlets',         nameHi: 'पैम्फलेट',             nameMr: 'पत्रक',                icon: '📄', sortOrder: 5 },
  { name: 'T-Shirt Printing',  nameHi: 'टी-शर्ट प्रिंटिंग',  nameMr: 'टी-शर्ट प्रिंटिंग',  icon: '👕', sortOrder: 6 },
  { name: 'Mug Printing',      nameHi: 'मग प्रिंटिंग',        nameMr: 'मग प्रिंटिंग',        icon: '☕', sortOrder: 7 },
  { name: 'ID Cards',          nameHi: 'आईडी कार्ड',           nameMr: 'ओळखपत्र',              icon: '🪪', sortOrder: 8 },
  { name: 'Xerox & Lamination',nameHi: 'ज़ेरॉक्स और लैमिनेशन', nameMr: 'झेरॉक्स आणि लॅमिनेशन', icon: '📋', sortOrder: 9 },
  { name: 'Offset Printing',   nameHi: 'ऑफसेट प्रिंटिंग',    nameMr: 'ऑफसेट प्रिंटिंग',    icon: '🖨️', sortOrder: 10 },
  { name: 'Digital Printing',  nameHi: 'डिजिटल प्रिंटिंग',   nameMr: 'डिजिटल प्रिंटिंग',   icon: '💻', sortOrder: 11 },
  { name: 'Photo Frames',      nameHi: 'फोटो फ्रेम',           nameMr: 'फोटो फ्रेम',           icon: '🖼', sortOrder: 12 },
];

const seedCategories = async () => {
  await Category.deleteMany({});
  const cats = await Category.insertMany(CATEGORIES);
  logger.info(`✅ Seeded ${cats.length} categories`);
  return cats;
};

const seedUsers = async () => {
  await User.deleteMany({});

  const users = await User.create([
    {
      name: 'Super Admin',
      email: process.env.ADMIN_EMAIL || 'admin@kiranprinting.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@1234',
      role: 'superadmin',
      isVerified: true,
      mobile: '9876543210',
    },
    {
      name: 'Rahul Patil',
      email: 'rahul@example.com',
      password: 'Test@1234',
      role: 'user',
      isVerified: true,
      mobile: '9876543211',
      preferredLanguage: 'mr',
    },
    {
      name: 'Priya Deshmukh',
      email: 'priya@example.com',
      password: 'Test@1234',
      role: 'user',
      isVerified: true,
      mobile: '9876543212',
    },
  ]);

  logger.info(`✅ Seeded ${users.length} users`);
  return users;
};

const seedProducts = async (categories, adminId) => {
  await Product.deleteMany({});

  const catMap = {};
  categories.forEach(c => { catMap[c.name] = c._id; });

  const PRODUCTS = [
    {
      name: 'Premium Visiting Cards',
      nameHi: 'प्रीमियम विजिटिंग कार्ड',
      nameMr: 'प्रीमियम व्हिजिटिंग कार्ड',
      description: 'Professional visiting cards with premium 350gsm art card. Available in matte/glossy lamination, spot UV, and embossing finishes. Fast 24-48 hour turnaround.',
      shortDescription: '350gsm premium business cards with matte/glossy lamination options.',
      category: catMap['Visiting Cards'],
      sku: 'VC-PREM-001',
      basePrice: 299,
      discountPrice: 249,
      gstRate: 18,
      hsnCode: '4909',
      minOrderQty: 100,
      maxOrderQty: 10000,
      unit: 'piece',
      stock: 99999,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      estimatedDelivery: '1-2 business days',
      images: [{ public_id: 'demo/visiting-card', url: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800', isPrimary: true }],
      pricingTiers: [
        { minQty: 100, maxQty: 499, pricePerUnit: 2.49 },
        { minQty: 500, maxQty: 999, pricePerUnit: 1.99 },
        { minQty: 1000, maxQty: 4999, pricePerUnit: 1.49 },
        { minQty: 5000, pricePerUnit: 0.99 },
      ],
      variations: [
        { name: 'Size', options: [{ label: 'Standard (3.5"×2")', priceModifier: 0, inStock: true }, { label: 'Square (2.5"×2.5")', priceModifier: 20, inStock: true }] },
        { name: 'Finish', options: [{ label: 'Matte Lamination', priceModifier: 0, inStock: true }, { label: 'Glossy Lamination', priceModifier: 10, inStock: true }, { label: 'Spot UV', priceModifier: 50, inStock: true }] },
      ],
      printingOptions: { paperWeights: ['350gsm', '400gsm'], colorOptions: ['4-Color (CMYK)', 'Black & White'], requiresDesignUpload: true, turnaroundTime: '24-48 hours' },
      tags: ['business card', 'visiting card', 'professional', 'dharashiv'],
      metaTitle: 'Premium Visiting Cards in Dharashiv | Kiran Printing Press',
      metaDescription: 'Order premium 350gsm visiting cards in Dharashiv, Maharashtra. Matte/glossy lamination, bulk discounts, 24-hr delivery.',
      createdBy: adminId,
    },
    {
      name: 'Wedding Invitation Cards',
      nameHi: 'शादी का निमंत्रण कार्ड',
      nameMr: 'लग्नपत्रिका',
      description: 'Beautiful custom wedding invitation cards for your special day. Available in various designs with premium paper and elegant finishes.',
      shortDescription: 'Elegant custom wedding cards with premium finish.',
      category: catMap['Wedding Cards'],
      sku: 'WC-CUST-001',
      basePrice: 899,
      discountPrice: 749,
      gstRate: 12,
      minOrderQty: 50,
      stock: 99999,
      isFeatured: true,
      isBestSeller: true,
      estimatedDelivery: '3-5 business days',
      images: [{ public_id: 'demo/wedding-card', url: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=800', isPrimary: true }],
      pricingTiers: [
        { minQty: 50, maxQty: 99, pricePerUnit: 14.98 },
        { minQty: 100, maxQty: 299, pricePerUnit: 12.00 },
        { minQty: 300, pricePerUnit: 9.00 },
      ],
      printingOptions: { paperSizes: ['A5', 'A4', 'DL', 'Square'], colorOptions: ['4-Color', 'Gold Foil', 'Silver Foil'], requiresDesignUpload: true, turnaroundTime: '3-5 business days' },
      tags: ['wedding', 'invitation', 'card', 'lagna', 'shaadi'],
      createdBy: adminId,
    },
    {
      name: 'Flex Banner Printing',
      nameHi: 'फ्लेक्स बैनर प्रिंटिंग',
      nameMr: 'फ्लेक्स बॅनर प्रिंटिंग',
      description: 'High-quality outdoor flex banner printing on 440gsm vinyl. Waterproof, UV-resistant inks. Perfect for shops, events, and promotions.',
      shortDescription: 'Outdoor flex banners with vibrant UV-resistant printing.',
      category: catMap['Flex Printing'],
      sku: 'FP-FLEX-001',
      basePrice: 45,
      gstRate: 18,
      minOrderQty: 1,
      stock: 99999,
      unit: 'sqft',
      isFeatured: true,
      estimatedDelivery: '1-2 business days',
      images: [{ public_id: 'demo/flex', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', isPrimary: true }],
      pricingTiers: [
        { minQty: 1, maxQty: 50, pricePerUnit: 45 },
        { minQty: 51, maxQty: 200, pricePerUnit: 40 },
        { minQty: 201, pricePerUnit: 35 },
      ],
      printingOptions: { allowCustomSize: true, colorOptions: ['Full Color'], requiresDesignUpload: true, turnaroundTime: '24 hours' },
      tags: ['flex', 'banner', 'outdoor', 'vinyl', 'advertising'],
      createdBy: adminId,
    },
    {
      name: 'Custom T-Shirt Printing',
      nameHi: 'कस्टम टी-शर्ट प्रिंटिंग',
      nameMr: 'कस्टम टी-शर्ट प्रिंटिंग',
      description: 'High-quality custom T-shirt printing using DTG (Direct to Garment) technology. Soft feel, long-lasting prints. Ideal for events, corporate, or personal use.',
      shortDescription: 'DTG custom T-shirt printing for events and promotions.',
      category: catMap['T-Shirt Printing'],
      sku: 'TS-DTG-001',
      basePrice: 349,
      discountPrice: 299,
      gstRate: 5,
      minOrderQty: 1,
      maxOrderQty: 500,
      stock: 5000,
      isFeatured: true,
      isNewArrival: true,
      estimatedDelivery: '2-3 business days',
      images: [{ public_id: 'demo/tshirt', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', isPrimary: true }],
      pricingTiers: [
        { minQty: 1, maxQty: 9, pricePerUnit: 299 },
        { minQty: 10, maxQty: 24, pricePerUnit: 249 },
        { minQty: 25, maxQty: 49, pricePerUnit: 199 },
        { minQty: 50, pricePerUnit: 149 },
      ],
      variations: [
        { name: 'Size', options: [{ label: 'S', priceModifier: 0, inStock: true }, { label: 'M', priceModifier: 0, inStock: true }, { label: 'L', priceModifier: 0, inStock: true }, { label: 'XL', priceModifier: 20, inStock: true }, { label: 'XXL', priceModifier: 40, inStock: true }] },
        { name: 'Print Side', options: [{ label: 'Front Only', priceModifier: 0, inStock: true }, { label: 'Front + Back', priceModifier: 80, inStock: true }] },
      ],
      printingOptions: { colorOptions: ['Full Color DTG', 'Screen Print', 'Embroidery'], requiresDesignUpload: true, turnaroundTime: '2-3 business days' },
      tags: ['tshirt', 'garment', 'custom', 'event', 'corporate'],
      createdBy: adminId,
    },
    {
      name: 'Pamphlet / Leaflet Printing',
      nameHi: 'पैम्फलेट / लीफलेट प्रिंटिंग',
      nameMr: 'पत्रक / लीफलेट प्रिंटिंग',
      description: 'Eye-catching pamphlets and leaflets for marketing and promotions. Available in A4, A5, DL sizes. 130gsm art paper with glossy/matte finish.',
      shortDescription: 'Marketing pamphlets in A4/A5/DL sizes with glossy/matte finish.',
      category: catMap['Pamphlets'],
      sku: 'PH-A5-001',
      basePrice: 1200,
      discountPrice: 999,
      gstRate: 12,
      minOrderQty: 100,
      stock: 99999,
      unit: 'piece',
      isBestSeller: true,
      estimatedDelivery: '2-3 business days',
      images: [{ public_id: 'demo/pamphlet', url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800', isPrimary: true }],
      pricingTiers: [
        { minQty: 100, maxQty: 499, pricePerUnit: 9.99 },
        { minQty: 500, maxQty: 1999, pricePerUnit: 7.99 },
        { minQty: 2000, pricePerUnit: 5.99 },
      ],
      printingOptions: { paperSizes: ['A4', 'A5', 'DL', 'A3'], colorOptions: ['Full Color', 'Black & White'], finishOptions: ['Matte', 'Glossy'], requiresDesignUpload: true, turnaroundTime: '2-3 business days' },
      tags: ['pamphlet', 'leaflet', 'flyer', 'marketing', 'promotion'],
      createdBy: adminId,
    },
    {
      name: 'Photo Mug Printing',
      nameHi: 'फोटो मग प्रिंटिंग',
      nameMr: 'फोटो मग प्रिंटिंग',
      description: 'Beautiful custom photo mugs using sublimation printing. Perfect gift for birthdays, anniversaries, and corporate events. High-quality durable print.',
      shortDescription: 'Custom sublimation photo mugs — perfect personalized gifts.',
      category: catMap['Mug Printing'],
      sku: 'MG-SUB-001',
      basePrice: 299,
      discountPrice: 249,
      gstRate: 18,
      minOrderQty: 1,
      stock: 2000,
      isNewArrival: true,
      isFeatured: true,
      estimatedDelivery: '1-2 business days',
      images: [{ public_id: 'demo/mug', url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', isPrimary: true }],
      pricingTiers: [
        { minQty: 1, maxQty: 4, pricePerUnit: 249 },
        { minQty: 5, maxQty: 19, pricePerUnit: 199 },
        { minQty: 20, pricePerUnit: 149 },
      ],
      variations: [{ name: 'Mug Type', options: [{ label: 'White Ceramic (11oz)', priceModifier: 0, inStock: true }, { label: 'Color Changing', priceModifier: 80, inStock: true }, { label: 'Travel Mug', priceModifier: 120, inStock: true }] }],
      printingOptions: { colorOptions: ['Full Color Sublimation'], requiresDesignUpload: true, turnaroundTime: '24 hours' },
      tags: ['mug', 'gift', 'photo', 'sublimation', 'custom'],
      createdBy: adminId,
    },
  ];

  const products = await Product.insertMany(PRODUCTS);
  logger.info(`✅ Seeded ${products.length} products`);

  // Update category product counts
  for (const cat of Object.values(catMap)) {
    const count = await Product.countDocuments({ category: cat });
    await Category.findByIdAndUpdate(cat, { productCount: count });
  }
};

const seedCoupons = async (adminId) => {
  await Coupon.deleteMany({});
  await Coupon.insertMany([
    {
      code: 'KIRAN20',
      description: '20% off on first order',
      discountType: 'percentage',
      discountValue: 20,
      maxDiscountAmount: 500,
      minOrderValue: 200,
      usageLimit: 1000,
      isFirstOrder: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      createdBy: adminId,
    },
    {
      code: 'FLAT100',
      description: '₹100 flat off on orders above ₹999',
      discountType: 'flat',
      discountValue: 100,
      minOrderValue: 999,
      usageLimit: 500,
      startDate: new Date(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      createdBy: adminId,
    },
    {
      code: 'BULK15',
      description: '15% off on bulk orders',
      discountType: 'percentage',
      discountValue: 15,
      maxDiscountAmount: 2000,
      minOrderValue: 2000,
      usageLimit: 200,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      createdBy: adminId,
    },
  ]);
  logger.info('✅ Seeded 3 coupons');
};

const seedTestimonials = async () => {
  // Testimonial already imported above
  await Testimonial.deleteMany({});
  await Testimonial.insertMany([
    { customerName: 'Rahul Patil', designation: 'Business Owner', company: 'Patil Enterprises', rating: 5, testimonial: 'Excellent quality and fast delivery. Best printing in Dharashiv!', isFeatured: true },
    { customerName: 'Priya Deshmukh', designation: 'Bride', rating: 5, testimonial: 'Beautiful wedding cards, exactly as designed. Very professional team.', isFeatured: true },
    { customerName: 'Sanjay Kulkarni', designation: 'Manager', company: 'Kulkarni Traders', rating: 5, testimonial: 'Best flex printing. Colors are vibrant and durable.', isFeatured: true },
    { customerName: 'Anita More', designation: 'Event Coordinator', company: 'SRSC College', rating: 4, testimonial: 'Great T-shirt printing for our college event. On-time delivery!', isFeatured: true },
  ]);
  logger.info('✅ Seeded 4 testimonials');
};

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('📦 Connected to MongoDB. Starting seed...');

    const categories = await seedCategories();
    const users = await seedUsers();
    const adminUser = users.find(u => u.role === 'superadmin');
    await seedProducts(categories, adminUser._id);
    await seedCoupons(adminUser._id);
    await seedTestimonials();

    logger.info('🌱 Database seeded successfully!');
    logger.info(`\n📧 Admin Login: ${adminUser.email}`);
    logger.info(`🔑 Admin Password: ${process.env.ADMIN_PASSWORD || 'Admin@1234'}`);
    logger.info(`🎟️  Coupon codes: KIRAN20, FLAT100, BULK15\n`);

  } catch (err) {
    logger.error(`Seed failed: ${err.message}`);
    console.error(err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

main();
