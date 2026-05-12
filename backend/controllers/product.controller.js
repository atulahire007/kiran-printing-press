const Product = require('../models/Product.model');
const { Category } = require('../models/index');
const ErrorResponse = require('../utils/ErrorResponse');
const { cloudinary } = require('../config/cloudinary');
const { buildProductQuery } = require('../utils/queryBuilder');

// ── GET ALL PRODUCTS ─────────────────────────
exports.getProducts = async (req, res) => {
  const { query, paginationOptions } = buildProductQuery(req.query);

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .select('-__v')
      .sort(paginationOptions.sort)
      .skip(paginationOptions.skip)
      .limit(paginationOptions.limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      products,
      pagination: {
        total,
        page: paginationOptions.page,
        limit: paginationOptions.limit,
        pages: Math.ceil(total / paginationOptions.limit),
      },
    },
  });
};

// ── GET SINGLE PRODUCT ───────────────────────
exports.getProduct = async (req, res) => {
  const { identifier } = req.params;
  const query = identifier.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: identifier }
    : { slug: identifier };

  const product = await Product.findOne({ ...query, status: 'active' })
    .populate('category', 'name slug')
    .populate({
      path: 'reviews',
      match: { isApproved: true },
      select: 'rating title comment user createdAt isVerifiedPurchase',
      populate: { path: 'user', select: 'name avatar' },
      options: { limit: 10, sort: { createdAt: -1 } },
    });

  if (!product) throw new ErrorResponse('Product not found', 404);

  // Related products
  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    status: 'active',
  })
    .select('name slug images basePrice discountPrice averageRating')
    .limit(8);

  res.status(200).json({ success: true, data: { product, related } });
};

// ── CREATE PRODUCT ───────────────────────────
exports.createProduct = async (req, res) => {
  req.body.createdBy = req.user.id;

  // Auto-generate SKU if not provided
  if (!req.body.sku) {
    const prefix = req.body.name.substring(0, 3).toUpperCase();
    req.body.sku = `${prefix}-${Date.now().toString().slice(-6)}`;
  }

  const product = await Product.create(req.body);

  // Update category product count
  await Category.findByIdAndUpdate(product.category, { $inc: { productCount: 1 } });

  res.status(201).json({ success: true, message: 'Product created successfully', data: { product } });
};

// ── UPDATE PRODUCT ───────────────────────────
exports.updateProduct = async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) throw new ErrorResponse('Product not found', 404);

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });

  res.status(200).json({ success: true, message: 'Product updated', data: { product } });
};

// ── DELETE PRODUCT ───────────────────────────
exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ErrorResponse('Product not found', 404);

  // Delete images from Cloudinary
  for (const image of product.images) {
    if (image.public_id) {
      await cloudinary.uploader.destroy(image.public_id);
    }
  }

  await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });
  await product.deleteOne();

  res.status(200).json({ success: true, message: 'Product deleted successfully' });
};

// ── UPLOAD PRODUCT IMAGES ────────────────────
exports.uploadProductImages = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ErrorResponse('Product not found', 404);

  if (!req.files?.length) throw new ErrorResponse('Please upload at least one image', 400);

  const newImages = req.files.map((file, idx) => ({
    public_id: file.filename,
    url: file.path,
    alt: `${product.name} - Image ${idx + 1}`,
    isPrimary: product.images.length === 0 && idx === 0,
  }));

  product.images.push(...newImages);
  await product.save();

  res.status(200).json({ success: true, message: 'Images uploaded', data: { images: product.images } });
};

// ── DELETE PRODUCT IMAGE ─────────────────────
exports.deleteProductImage = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ErrorResponse('Product not found', 404);

  const { publicId } = req.body;
  const image = product.images.find(img => img.public_id === publicId);
  if (!image) throw new ErrorResponse('Image not found', 404);

  await cloudinary.uploader.destroy(publicId);
  product.images = product.images.filter(img => img.public_id !== publicId);

  // Set new primary if needed
  if (image.isPrimary && product.images.length > 0) {
    product.images[0].isPrimary = true;
  }

  await product.save();
  res.status(200).json({ success: true, message: 'Image deleted', data: { images: product.images } });
};

// ── SEARCH PRODUCTS ──────────────────────────
exports.searchProducts = async (req, res) => {
  const { q, limit = 10 } = req.query;
  if (!q || q.length < 2) throw new ErrorResponse('Search query must be at least 2 characters', 400);

  const products = await Product.find({
    $text: { $search: q },
    status: 'active',
  }, {
    score: { $meta: 'textScore' },
  })
    .populate('category', 'name')
    .select('name slug images basePrice discountPrice category averageRating')
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseInt(limit))
    .lean();

  res.status(200).json({ success: true, data: { products, query: q } });
};

// ── GET PRICE ESTIMATE ───────────────────────
exports.getPriceEstimate = async (req, res) => {
  const { id } = req.params;
  const { quantity = 1, paperSize, paperWeight, colorOption, finish, lamination } = req.body;

  const product = await Product.findById(id);
  if (!product) throw new ErrorResponse('Product not found', 404);

  let basePrice = product.getPriceForQty(parseInt(quantity));
  let priceModifiers = 0;

  // Apply variation modifiers
  if (product.variations?.length) {
    const optionsMap = { paperSize, paperWeight, colorOption, finish, lamination };
    product.variations.forEach(variation => {
      const key = variation.name.toLowerCase().replace(/\s+/g, '');
      const selectedOption = optionsMap[key];
      if (selectedOption) {
        const opt = variation.options.find(o => o.label === selectedOption);
        if (opt) priceModifiers += opt.priceModifier || 0;
      }
    });
  }

  const unitPrice = basePrice + priceModifiers;
  const subtotal = unitPrice * quantity;
  const gstAmount = (subtotal * product.gstRate) / 100;
  const total = subtotal + gstAmount;

  res.status(200).json({
    success: true,
    data: {
      unitPrice,
      quantity,
      subtotal,
      gstRate: product.gstRate,
      gstAmount,
      total,
      breakdown: { basePrice, priceModifiers, gstAmount },
    },
  });
};

// ── FEATURED / NEW ARRIVALS / BESTSELLERS ────
exports.getFeaturedProducts = async (req, res) => {
  const { type = 'featured', limit = 12 } = req.query;
  const filterMap = { featured: { isFeatured: true }, new: { isNewArrival: true }, bestseller: { isBestSeller: true } };

  const products = await Product.find({ ...filterMap[type], status: 'active' })
    .populate('category', 'name slug')
    .select('name slug images basePrice discountPrice averageRating numReviews isFeatured category')
    .limit(parseInt(limit))
    .lean();

  res.status(200).json({ success: true, data: { products } });
};
