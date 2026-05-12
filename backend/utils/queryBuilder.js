/**
 * Build MongoDB query from URL query params for product listing
 */
exports.buildProductQuery = (queryParams) => {
  const {
    category, minPrice, maxPrice, rating, status = 'active',
    featured, newArrival, bestSeller, inStock,
    page = 1, limit = 12,
    sort = '-createdAt',
    q,
  } = queryParams;

  const query = { status };

  if (category) query.category = category;

  if (minPrice || maxPrice) {
    query.basePrice = {};
    if (minPrice) query.basePrice.$gte = parseFloat(minPrice);
    if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice);
  }

  if (rating) query.averageRating = { $gte: parseFloat(rating) };
  if (featured === 'true') query.isFeatured = true;
  if (newArrival === 'true') query.isNewArrival = true;
  if (bestSeller === 'true') query.isBestSeller = true;
  if (inStock === 'true') query.stock = { $gt: 0 };

  if (q) {
    query.$text = { $search: q };
  }

  // Sort mapping
  const sortMap = {
    '-createdAt': { createdAt: -1 },
    'price_asc': { basePrice: 1 },
    'price_desc': { basePrice: -1 },
    '-averageRating': { averageRating: -1 },
    '-totalSold': { totalSold: -1 },
    'name': { name: 1 },
  };
  const sortQuery = sortMap[sort] || { createdAt: -1 };

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

  return {
    query,
    paginationOptions: {
      page: pageNum,
      limit: limitNum,
      skip: (pageNum - 1) * limitNum,
      sort: sortQuery,
    },
  };
};
