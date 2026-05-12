// product.routes.js
const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  uploadProductImages, deleteProductImage, searchProducts, getPriceEstimate, getFeaturedProducts,
} = require('../controllers/product.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { uploadProductImages: uploadMiddleware } = require('../config/cloudinary');

router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:identifier', getProduct);
router.post('/:id/price-estimate', getPriceEstimate);

// Admin routes
router.post('/', protect, authorize('admin', 'superadmin'), createProduct);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateProduct);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteProduct);
router.post('/:id/images', protect, authorize('admin', 'superadmin'), uploadMiddleware.array('images', 10), uploadProductImages);
router.delete('/:id/images', protect, authorize('admin', 'superadmin'), deleteProductImage);

module.exports = router;

// ─────────────────────────────────────────
// category.routes.js — inline export below (real app = separate file)
// ─────────────────────────────────────────
