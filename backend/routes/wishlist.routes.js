const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const Product = require('../models/Product.model');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/', async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist', 'name images basePrice discountPrice slug category');
  res.json({ success: true, data: { items: user.wishlist || [] } });
});

router.post('/toggle/:productId', async (req, res) => {
  const user = await User.findById(req.user.id);
  const pid = req.params.productId;
  const idx = user.wishlist.findIndex(id => id.toString() === pid);
  let added;
  if (idx > -1) { user.wishlist.splice(idx, 1); added = false; }
  else { user.wishlist.push(pid); added = true; }
  await user.save({ validateBeforeSave: false });
  const populated = await User.findById(req.user.id).populate('wishlist', 'name images basePrice discountPrice slug');
  res.json({ success: true, data: { added, items: populated.wishlist } });
});

module.exports = router;
