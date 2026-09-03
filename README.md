# Forever — Full-Stack E-Commerce (MERN)

Forever is a MERN stack e-commerce application with a customer storefront, admin dashboard, REST APIs, MongoDB, Cloudinary image uploads, JWT authentication, wishlist, and verified product reviews.

## Live Demo

Add your deployed URLs here after deployment:

- **Storefront:** `https://your-frontend-url.vercel.app`
- **Admin Panel:** `https://your-admin-url.vercel.app`
- **Backend API:** `https://your-backend-url.onrender.com`

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind CSS, Axios, React Router |
| Admin | React, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Images | Cloudinary, Multer |
| Payments | COD, Stripe, Razorpay (optional) |

## Project Structure

```text
Forever/
├── frontend/     # Customer-facing React app (port 5173)
├── admin/        # Admin dashboard React app (port 5174)
├── backend/      # Express API server (port 4000)
└── vercel.json   # Deployment routing config
```

## Features

### Storefront
- Product listing, search, collection filters
- Product details with related products
- Cart and checkout (COD / online payment)
- User login and registration
- Profile, orders, and wishlist
- Product reviews (verified buyers only)

### Admin
- Admin login
- Product CRUD with image upload
- Product edit with image add/remove
- Order list and status management

### Backend
- REST APIs for users, products, cart, orders, wishlist, reviews
- JWT-protected routes
- Cloudinary upload and safe image cleanup

## Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

## Environment Variables

Copy the example files and fill in your values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp admin/.env.example admin/.env
```

Never commit real `.env` files.

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `CLOUDINARY_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_SECRET_KEY` | Cloudinary API secret |
| `PORT` | Server port (default: `4000`) |
| `STRIPE_SECRET_KEY` | Optional Stripe payments |
| `RAZORPAY_KEY_ID` | Optional Razorpay payments |
| `RAZORPAY_KEY_SECRET` | Optional Razorpay secret |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_BACKEND_URL` | Backend API URL |
| `VITE_RAZORPAY_KEY_ID` | Optional Razorpay public key |

### Admin (`admin/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_BACKEND_URL` | Backend API URL |

## Local Setup

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install
```

### 2. Configure environment files

Create `.env` files from the examples above.

### 3. Start backend

```bash
cd backend
npm run server
```

Backend runs on `http://localhost:4000`

### 4. Start storefront

```bash
cd frontend
npm run dev
```

Storefront runs on `http://localhost:5173`

### 5. Start admin panel

```bash
cd admin
npm run dev
```

Admin runs on `http://localhost:5174`

## Optional: Seed sample products

```bash
cd backend
node seed.js
```

## API Overview

| Route Prefix | Purpose |
|--------------|---------|
| `/api/user` | Register, login, profile |
| `/api/product` | Product CRUD and listing |
| `/api/cart` | Cart operations |
| `/api/order` | Orders and payments |
| `/api/wishlist` | Wishlist operations |
| `/api/review` | Product reviews |

## Deployment Notes

- **Backend:** Render (or Vercel Node)
- **Frontend / Admin:** Vercel
- Set `VITE_BACKEND_URL` in Vercel to your deployed backend URL
- Allow `0.0.0.0/0` in MongoDB Atlas Network Access for cloud hosting
- URL-encode special characters in `MONGO_URI` password if needed

## Git Workflow

```text
main                 -> stable production branch
feature/*            -> new features
fix/*                -> bug fixes
docs/*               -> documentation updates
```

Typical flow:

1. Create feature branch from `main`
2. Develop and test locally
3. Commit with a clear message
4. Push branch and open a PR
5. Merge into `main` after review

## Author

Denish — Forever MERN E-Commerce Project
