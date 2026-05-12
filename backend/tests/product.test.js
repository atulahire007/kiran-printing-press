/**
 * Product & Order Controller Tests
 * Run: npm test
 */
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User.model');
const Product = require('../models/Product.model');
const { Category } = require('../models/index');

let adminToken;
let userToken;
let testCategoryId;
let testProductId;

const ADMIN_CREDS = { email: 'admin.test@kirantest.com', password: 'Admin@Test123' };
const USER_CREDS  = { email: 'user.test@kirantest.com',  password: 'User@Test123' };

beforeAll(async () => {
  const testDbUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/kiran_test';
  await mongoose.connect(testDbUri);

  // Create admin + user
  const [admin, user] = await User.create([
    { name: 'Test Admin', email: ADMIN_CREDS.email, password: ADMIN_CREDS.password, role: 'admin', isVerified: true, mobile: '9000000001' },
    { name: 'Test User',  email: USER_CREDS.email,  password: USER_CREDS.password,  role: 'user',  isVerified: true, mobile: '9000000002' },
  ]);

  // Login both
  const [adminRes, userRes] = await Promise.all([
    request(app).post('/api/v1/auth/login').send(ADMIN_CREDS),
    request(app).post('/api/v1/auth/login').send(USER_CREDS),
  ]);
  adminToken = adminRes.body.token;
  userToken  = userRes.body.token;

  // Create test category
  const cat = await Category.create({ name: 'Test Category', slug: 'test-category-prod', isActive: true });
  testCategoryId = cat._id.toString();
});

afterAll(async () => {
  await Promise.all([
    User.deleteMany({ email: { $in: [ADMIN_CREDS.email, USER_CREDS.email] } }),
    Product.deleteMany({ sku: /^TEST-/ }),
    Category.deleteMany({ slug: 'test-category-prod' }),
  ]);
  await mongoose.connection.close();
});

// ── Product CRUD ─────────────────────────────
describe('Product API', () => {
  describe('POST /api/v1/products (Admin)', () => {
    it('should create a product as admin', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Visiting Card',
          description: 'Test product description for unit testing',
          category: testCategoryId,
          sku: 'TEST-VC-001',
          basePrice: 299,
          gstRate: 18,
          stock: 1000,
          minOrderQty: 100,
          unit: 'piece',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.product.sku).toBe('TEST-VC-001');
      expect(res.body.data.product.status).toBe('active');
      testProductId = res.body.data.product._id;
    });

    it('should reject product creation without auth', async () => {
      await request(app)
        .post('/api/v1/products')
        .send({ name: 'Unauth Product', sku: 'TEST-NO-AUTH' })
        .expect(401);
    });

    it('should reject product creation by regular user', async () => {
      await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'User Product', sku: 'TEST-USER-001' })
        .expect(403);
    });

    it('should reject product with duplicate SKU', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Duplicate SKU Product',
          description: 'Test',
          category: testCategoryId,
          sku: 'TEST-VC-001', // duplicate
          basePrice: 199,
          gstRate: 18,
          stock: 100,
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/products', () => {
    it('should return paginated products', async () => {
      const res = await request(app)
        .get('/api/v1/products?page=1&limit=10')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination).toHaveProperty('total');
      expect(res.body.data.pagination).toHaveProperty('pages');
    });

    it('should filter by category', async () => {
      const res = await request(app)
        .get(`/api/v1/products?category=${testCategoryId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      res.body.data.products.forEach(p => {
        expect(p.category._id || p.category).toBe(testCategoryId);
      });
    });

    it('should support price range filter', async () => {
      const res = await request(app)
        .get('/api/v1/products?minPrice=100&maxPrice=500')
        .expect(200);

      expect(res.body.success).toBe(true);
      res.body.data.products.forEach(p => {
        expect(p.basePrice).toBeGreaterThanOrEqual(100);
        expect(p.basePrice).toBeLessThanOrEqual(500);
      });
    });
  });

  describe('GET /api/v1/products/search', () => {
    it('should search products by query', async () => {
      const res = await request(app)
        .get('/api/v1/products/search?q=visiting')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
    });

    it('should reject short search queries', async () => {
      await request(app)
        .get('/api/v1/products/search?q=a')
        .expect(400);
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should return product by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/products/${testProductId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.product._id).toBe(testProductId);
      expect(res.body.data.related).toBeDefined();
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/v1/products/${fakeId}`)
        .expect(404);
    });
  });

  describe('PUT /api/v1/products/:id (Admin)', () => {
    it('should update a product as admin', async () => {
      const res = await request(app)
        .put(`/api/v1/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ basePrice: 349, isFeatured: true })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.product.basePrice).toBe(349);
      expect(res.body.data.product.isFeatured).toBe(true);
    });
  });

  describe('POST /api/v1/products/:id/price-estimate', () => {
    it('should calculate price for given quantity', async () => {
      const res = await request(app)
        .post(`/api/v1/products/${testProductId}/price-estimate`)
        .send({ quantity: 500 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.unitPrice).toBeDefined();
      expect(res.body.data.total).toBeDefined();
      expect(res.body.data.gstAmount).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/v1/products/:id (Admin)', () => {
    it('should delete a product as admin', async () => {
      await request(app)
        .delete(`/api/v1/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should return 404 after deletion', async () => {
      await request(app)
        .get(`/api/v1/products/${testProductId}`)
        .expect(404);
    });
  });
});

// ── Cart API ─────────────────────────────────
describe('Cart API', () => {
  let cartProductId;

  beforeAll(async () => {
    // Create a cart product
    const p = await Product.create({
      name: 'Cart Test Product',
      description: 'For cart testing',
      category: testCategoryId,
      sku: 'TEST-CART-001',
      basePrice: 199,
      gstRate: 18,
      stock: 500,
      minOrderQty: 1,
      unit: 'piece',
    });
    cartProductId = p._id.toString();
  });

  afterAll(async () => {
    await Product.deleteMany({ sku: 'TEST-CART-001' });
  });

  it('should get empty cart for new user', async () => {
    const res = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.cart.items).toHaveLength(0);
  });

  it('should add item to cart', async () => {
    const res = await request(app)
      .post('/api/v1/cart/add')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: cartProductId, quantity: 5 })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.cart.items).toHaveLength(1);
    expect(res.body.data.cart.items[0].quantity).toBe(5);
  });

  it('should apply valid coupon', async () => {
    const { Coupon } = require('../models/index');
    await Coupon.create({
      code: 'TESTCOUPON',
      discountType: 'flat',
      discountValue: 50,
      minOrderValue: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      isActive: true,
      createdBy: new mongoose.Types.ObjectId(),
    });

    const res = await request(app)
      .post('/api/v1/cart/coupon')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: 'TESTCOUPON' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.discount).toBe(50);

    await Coupon.deleteOne({ code: 'TESTCOUPON' });
  });

  it('should reject invalid coupon', async () => {
    await request(app)
      .post('/api/v1/cart/coupon')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: 'INVALIDCOUPON123' })
      .expect(400);
  });

  it('should require auth to access cart', async () => {
    await request(app).get('/api/v1/cart').expect(401);
  });
});

// ── Categories ───────────────────────────────
describe('Category API', () => {
  it('should list all categories', async () => {
    const res = await request(app)
      .get('/api/v1/categories')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.categories)).toBe(true);
  });
});
