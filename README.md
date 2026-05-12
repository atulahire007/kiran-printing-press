# 🖨️ Kiran Printing Press — Full-Stack E-Commerce Platform

> **Premium Printing Services | Dharashiv, Maharashtra, India**
> Complete multilingual (English, Hindi, Marathi) e-commerce website with admin dashboard.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Docker Deployment](#docker-deployment)
- [Nginx + SSL Setup](#nginx--ssl-setup)
- [Admin Panel](#admin-panel)
- [PWA Support](#pwa-support)
- [Multilingual](#multilingual)

---

## 🎯 Overview

A production-ready e-commerce platform built specifically for **Kiran Printing Press**, a local printing business in Dharashiv, Maharashtra. The platform supports 12+ printing product categories, online ordering with Razorpay payment gateway, design file uploads, order tracking, multilingual support (en/hi/mr), and a full admin dashboard.

---

## 🛠 Tech Stack

| Layer       | Technology                                           |
|-------------|------------------------------------------------------|
| Frontend    | React 18, Vite 5, Tailwind CSS, Redux Toolkit        |
| Backend     | Node.js, Express.js, MongoDB, Mongoose               |
| Auth        | JWT, bcrypt, OTP (Twilio), Google OAuth              |
| Payment     | Razorpay (UPI, Cards, Netbanking, Wallet)            |
| Storage     | Cloudinary (images, design files)                    |
| Email       | Nodemailer (Gmail SMTP)                              |
| SMS         | Twilio                                               |
| i18n        | react-i18next (en, hi, mr)                          |
| Charts      | Recharts                                             |
| Deployment  | Docker, Nginx, Let's Encrypt SSL                     |

---

## ✨ Features

### 👤 Customer Features
- Browse 12+ printing product categories
- Live price calculator (quantity × paper × finish)
- Design file upload (PDF, PNG, JPG, AI, PSD, CDR)
- Add to cart, wishlist, coupon codes
- Razorpay payment (UPI, card, netbanking, wallet)
- Cash on Delivery option
- Real-time order tracking (8 status stages)
- PDF invoice download
- Customer reviews & ratings
- User dashboard (profile, orders, addresses, wishlist)
- Loyalty points system
- Referral code sharing
- WhatsApp order updates

### 🔐 Authentication
- Email/password registration & login
- Mobile OTP login (Twilio)
- Google OAuth
- JWT with httpOnly cookies
- Email verification & password reset

### 🌐 Multilingual
- English, Hindi (हिन्दी), Marathi (मराठी)
- Language switcher in navbar
- Translated product names & descriptions
- SEO-friendly with hreflang tags
- Per-user language preference

### 👨‍💼 Admin Panel
- Revenue analytics with charts
- Order management with status updates
- Product CRUD with image upload
- Category management
- User management (block/unblock)
- Coupon management (% and flat discounts)
- Banner management
- Gallery management
- Testimonial management

---

## 📁 Project Structure

```
kiran-printing-press/
├── backend/
│   ├── config/           # DB, Cloudinary config
│   ├── controllers/      # Route controllers
│   ├── middlewares/       # Auth, error handler
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routes
│   ├── utils/            # Logger, email, SMS, seeder
│   ├── server.js         # App entry point
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route pages
│   │   │   ├── admin/    # Admin dashboard pages
│   │   │   └── dashboard/# User dashboard pages
│   │   ├── redux/        # Store + slices
│   │   │   └── slices/
│   │   ├── services/     # Axios API service
│   │   ├── layouts/      # Main + Admin layouts
│   │   ├── i18n/         # Translations (en, hi, mr)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── Dockerfile
│
├── nginx/
│   └── nginx.conf        # Reverse proxy + SSL
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB 7.0+
- npm or yarn

### 1. Clone & Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run seed      # Seed demo data
npm run dev       # Start on port 5000
```

### 2. Setup Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL and VITE_RAZORPAY_KEY_ID
npm install
npm run dev       # Start on port 3000
```

### 3. Access the app

| Service       | URL                          |
|---------------|------------------------------|
| Frontend      | http://localhost:3000         |
| Backend API   | http://localhost:5000/api/v1  |
| Admin Panel   | http://localhost:3000/admin   |

**Default Admin:**
- Email: `admin@kiranprinting.com`
- Password: `Admin@1234`

---

## 🔑 Environment Variables

### Backend (`.env`)

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/kiran_printing_press
JWT_SECRET=your_secret_min_32_chars
JWT_EXPIRE=30d

CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=your@gmail.com

TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx
```

### Frontend (`.env`)

```env
VITE_API_URL=/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_xxx
```

---

## 📡 API Documentation

### Base URL: `/api/v1`

#### Auth
| Method | Endpoint                  | Description            |
|--------|---------------------------|------------------------|
| POST   | /auth/register            | Register user          |
| POST   | /auth/login               | Login with email/pass  |
| POST   | /auth/send-otp            | Send OTP to mobile     |
| POST   | /auth/verify-otp          | Verify OTP             |
| GET    | /auth/me                  | Get current user       |
| POST   | /auth/forgot-password     | Send reset link        |
| PUT    | /auth/reset-password/:tok | Reset password         |

#### Products
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | /products                       | List (filters, pagination)|
| GET    | /products/search?q=xxx          | Full-text search         |
| GET    | /products/featured?type=featured| Featured/new/bestsellers |
| GET    | /products/:slug                 | Product detail           |
| POST   | /products/:id/price-estimate    | Price calculator         |
| POST   | /products                       | Create (Admin)           |
| PUT    | /products/:id                   | Update (Admin)           |
| DELETE | /products/:id                   | Delete (Admin)           |

#### Orders
| Method | Endpoint                       | Description            |
|--------|--------------------------------|------------------------|
| POST   | /orders                        | Place order            |
| POST   | /orders/razorpay/create        | Create Razorpay order  |
| POST   | /orders/razorpay/verify        | Verify payment         |
| GET    | /orders/my-orders              | User's orders          |
| GET    | /orders/:id                    | Order details          |
| PUT    | /orders/:id/cancel             | Cancel order           |
| GET    | /orders/:id/invoice            | Download PDF invoice   |
| GET    | /orders/admin/all              | All orders (Admin)     |
| PUT    | /orders/:id/status             | Update status (Admin)  |

#### Cart
| Method | Endpoint          | Description         |
|--------|-------------------|---------------------|
| GET    | /cart             | Get cart            |
| POST   | /cart/add         | Add item            |
| PUT    | /cart/item/:id    | Update quantity     |
| DELETE | /cart/item/:id    | Remove item         |
| POST   | /cart/coupon      | Apply coupon        |
| DELETE | /cart/coupon      | Remove coupon       |

---

## 🐳 Docker Deployment

```bash
# Production
cp backend/.env.example .env
# Fill all production values in .env

docker-compose up -d --build

# Check logs
docker-compose logs -f backend

# Seed production data
docker-compose exec backend node utils/seeder.js

# Stop
docker-compose down
```

---

## 🔒 Nginx + SSL Setup

```bash
# Initial HTTP only (for Certbot challenge)
docker-compose up -d nginx

# Get SSL certificate
docker-compose --profile ssl run certbot

# Uncomment HTTPS server block in nginx/nginx.conf
# Restart nginx
docker-compose restart nginx
```

---

## 📱 PWA Support

The app includes Progressive Web App support via `vite-plugin-pwa`:
- Add to Home Screen
- Offline support (Workbox)
- Push notifications ready
- App icons for all platforms

---

## 🌐 Multilingual (i18n)

Languages: **English**, **हिन्दी** (Hindi), **मराठी** (Marathi)

- Translations in `frontend/src/i18n/locales/`
- Language switcher in Navbar
- Auto-detects browser language
- Persists preference in localStorage
- Product names/descriptions translated in DB schema

---

## 📦 Seeded Demo Data

After running `npm run seed`:
- ✅ 12 categories
- ✅ 6 featured products with bulk pricing
- ✅ 3 users (1 admin, 2 customers)
- ✅ 3 coupon codes: `KIRAN20`, `FLAT100`, `BULK15`
- ✅ 4 testimonials

---

## 🧪 Test Credentials

| Role       | Email                         | Password    |
|------------|-------------------------------|-------------|
| Super Admin| admin@kiranprinting.com       | Admin@1234  |
| Customer   | rahul@example.com             | Test@1234   |
| Customer   | priya@example.com             | Test@1234   |

---

## 📞 Support

**Kiran Printing Press**
📍 Main Road, Dharashiv, Maharashtra - 413501
📞 +91 98765 43210
📧 kiranprinting@gmail.com
💬 WhatsApp: +91 98765 43210

---

*Built with ❤️ for Kiran Printing Press, Dharashiv, Maharashtra*
