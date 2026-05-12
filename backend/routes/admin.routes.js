const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
  getAllUsers, toggleUserBlock, getUserDetail,
  getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  getContacts, updateContactStatus,
  getBanners, createBanner, updateBanner, deleteBanner,
  sendBroadcast,
} = require('../controllers/admin.controller');

router.use(protect, authorize('admin', 'superadmin'));
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetail);
router.put('/users/:id/block', toggleUserBlock);
router.get('/testimonials', getTestimonials);
router.post('/testimonials', createTestimonial);
router.put('/testimonials/:id', updateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);
router.get('/contacts', getContacts);
router.put('/contacts/:id', updateContactStatus);
router.get('/banners', getBanners);
router.post('/banners', createBanner);
router.put('/banners/:id', updateBanner);
router.delete('/banners/:id', deleteBanner);
router.post('/broadcast', sendBroadcast);
module.exports = router;
