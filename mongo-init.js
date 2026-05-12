// MongoDB initialization script
// Runs when the container is first created

db = db.getSiblingDB('kiran_printing_press');

db.createUser({
  user: 'kiran_app',
  pwd: 'kiran_app_secure_pass',
  roles: [{ role: 'readWrite', db: 'kiran_printing_press' }]
});

// Create indexes for performance
db.products.createIndex({ slug: 1 }, { unique: true });
db.products.createIndex({ category: 1, status: 1 });
db.products.createIndex({ name: 'text', description: 'text', tags: 'text' });
db.products.createIndex({ isFeatured: 1, status: 1 });
db.products.createIndex({ totalSold: -1 });

db.orders.createIndex({ user: 1, createdAt: -1 });
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ mobile: 1 });
db.users.createIndex({ referralCode: 1 });

db.reviews.createIndex({ product: 1, isApproved: 1 });
db.notifications.createIndex({ user: 1, isRead: 1, createdAt: -1 });
db.coupons.createIndex({ code: 1 }, { unique: true });

print('✅ MongoDB initialized for Kiran Printing Press');
