#!/bin/bash
# This script creates all remaining route stub files

cat > /home/claude/kiran-printing-press/backend/routes/category.routes.js << 'EOF'
module.exports = require('./combined.routes').catRouter || require('express').Router();
EOF

# Create each stub
for route in wishlist review coupon upload banner contact admin analytics notification cms; do
  cat > "/home/claude/kiran-printing-press/backend/routes/${route}.routes.js" << EOF
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
// TODO: ${route} controller & routes
router.get('/', protect, (req, res) => res.json({ success: true, message: '${route} endpoint active' }));
module.exports = router;
EOF
done
echo "Stubs created"