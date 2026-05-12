/**
 * Auth Controller Tests
 * Run: npm test
 */
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User.model');

const TEST_USER = {
  name: 'Test User',
  email: 'testuser@kirantest.com',
  password: 'Test@1234',
  mobile: '9876543299',
};

let authToken;
let testUserId;

beforeAll(async () => {
  // Use a test database
  const testDbUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/kiran_test';
  await mongoose.connect(testDbUri);
});

afterAll(async () => {
  await User.deleteMany({ email: TEST_USER.email });
  await mongoose.connection.close();
});

// ── Registration ─────────────────────────────
describe('POST /api/v1/auth/register', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(TEST_USER)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(TEST_USER.email);
    expect(res.body.data.user.role).toBe('user');
    expect(res.body.token).toBeDefined();

    testUserId = res.body.data.user._id;
    authToken = res.body.token;
  });

  it('should reject duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(TEST_USER)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it('should reject registration with invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...TEST_USER, email: 'not-an-email', mobile: '9999999990' })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('should reject short passwords', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...TEST_USER, email: 'new2@test.com', password: '123', mobile: '9999999991' })
      .expect(400);

    expect(res.body.success).toBe(false);
  });
});

// ── Login ────────────────────────────────────
describe('POST /api/v1/auth/login', () => {
  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.data.user.email).toBe(TEST_USER.email);
    authToken = res.body.token;
  });

  it('should reject invalid password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: 'wrongpassword' })
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('should reject non-existent email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@nowhere.com', password: 'Test@1234' })
      .expect(401);

    expect(res.body.success).toBe(false);
  });
});

// ── Get Me ───────────────────────────────────
describe('GET /api/v1/auth/me', () => {
  it('should return current user with valid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(TEST_USER.email);
  });

  it('should reject request without token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it('should reject with invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid.token.here')
      .expect(401);

    expect(res.body.success).toBe(false);
  });
});

// ── Update Profile ───────────────────────────
describe('PUT /api/v1/auth/me', () => {
  it('should update profile successfully', async () => {
    const res = await request(app)
      .put('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Updated Name', preferredLanguage: 'hi' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe('Updated Name');
    expect(res.body.data.user.preferredLanguage).toBe('hi');
  });
});

// ── Password Update ──────────────────────────
describe('PUT /api/v1/auth/me/password', () => {
  it('should reject wrong current password', async () => {
    const res = await request(app)
      .put('/api/v1/auth/me/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ currentPassword: 'wrongpass', newPassword: 'New@1234' })
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it('should update password with correct current password', async () => {
    const res = await request(app)
      .put('/api/v1/auth/me/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ currentPassword: TEST_USER.password, newPassword: 'NewPass@5678' })
      .expect(200);

    expect(res.body.success).toBe(true);

    // Restore original password
    await User.findOneAndUpdate(
      { email: TEST_USER.email },
      { password: await require('bcryptjs').hash(TEST_USER.password, 12) }
    );
  });
});

// ── Address Management ───────────────────────
describe('POST /api/v1/auth/addresses', () => {
  it('should add a new address', async () => {
    const res = await request(app)
      .post('/api/v1/auth/addresses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Home Address',
        mobile: '9876543210',
        addressLine1: 'Test Street 123',
        city: 'Dharashiv',
        district: 'Dharashiv',
        state: 'Maharashtra',
        pincode: '413501',
        addressType: 'home',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.addresses).toHaveLength(1);
    expect(res.body.data.addresses[0].city).toBe('Dharashiv');
  });
});

// ── Health check ─────────────────────────────
describe('GET /health', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/running/i);
  });
});
