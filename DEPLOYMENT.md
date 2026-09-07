# Forever — Deployment Guide

Use this checklist to keep **storefront**, **admin**, and **backend** working in production.

## Live URLs (your project)

| App | URL |
|-----|-----|
| Storefront | https://forever-five-zeta.vercel.app |
| Backend API | https://forever1-t5kk.onrender.com |
| Admin | Deploy separately on Vercel (see below) |

---

## 1. Backend (Render)

**Service:** Web Service → Node → `backend` folder (or root with start command)

**Start command:**
```bash
npm start
```
(or `node server.js` from `backend/`)

**Required environment variables:**

| Variable | Example / notes |
|----------|-----------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random secret |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `CLOUDINARY_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary key |
| `CLOUDINARY_SECRET_KEY` | Cloudinary secret |
| `FRONTEND_URL` | `https://forever-five-zeta.vercel.app` (no trailing slash) |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` on Render (use `587` locally if that works) |
| `SMTP_SECURE` | `true` when using port `465` |
| `SMTP_USER` | Gmail address |
| `SMTP_PASS` | Gmail app password |
| `SMTP_FROM` | `Forever <your@gmail.com>` |

**Optional (payments):** `STRIPE_SECRET_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

**After deploy — run once from your PC** (uses same `MONGO_URI` as Render):

```bash
cd backend
node seed.js          # products (only if DB is empty)
npm run seed:coupons  # SAVE20 + FLAT100 coupons
```

**Health check:** open https://forever1-t5kk.onrender.com → should show `API Working`

> Render free tier sleeps after inactivity. First request may take ~30–60 seconds (cold start).

---

## 2. Storefront (Vercel)

**Project settings:**
- Root Directory: `frontend` ← **required** (repo root deploy will fail)
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

**If build fails (project like `forever-x9do`):** you deployed the whole repo. Fix: **Settings → General → Root Directory → `frontend`**, then Redeploy. API stays on Render — do not build `backend/` on Vercel.

**Environment variable (required):**

| Variable | Value |
|----------|--------|
| `VITE_BACKEND_URL` | `https://forever1-t5kk.onrender.com` |

**Optional:** `VITE_RAZORPAY_KEY_ID` if using Razorpay

`frontend/vercel.json` handles SPA routing (`/orders`, `/reset-password`, etc.).

**Redeploy:** Vercel → Deployments → Redeploy after every `main` merge.

---

## 3. Admin panel (Vercel — separate project)

Create a **new** Vercel project from the same GitHub repo:

| Setting | Value |
|---------|--------|
| Root Directory | `admin` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

**Environment variable:**

| Variable | Value |
|----------|--------|
| `VITE_BACKEND_URL` | `https://forever1-t5kk.onrender.com` |

`admin/vercel.json` handles client-side routing.

Login with `ADMIN_EMAIL` + `ADMIN_PASSWORD` from Render env vars.

---

## 4. MongoDB Atlas

- Network Access → allow `0.0.0.0/0` (or Vercel/Render IPs)
- Database user with read/write access
- URL-encode special characters in password inside `MONGO_URI`

---

## 5. Feature checklist (production)

| Feature | Needs |
|---------|--------|
| Products | `node seed.js` (once) |
| Coupons | `npm run seed:coupons` (once) |
| Login / signup | `JWT_SECRET`, `MONGO_URI` |
| Forgot password | SMTP vars + `FRONTEND_URL` |
| Order emails | SMTP vars + `FRONTEND_URL` |
| Cart / wishlist / reviews | Backend + `VITE_BACKEND_URL` |
| Admin dashboard | Admin Vercel deploy + backend env |
| Stripe / Razorpay | Optional keys on backend + frontend |

**Email not sending on production?** Local `npm run test:smtp` can pass while Render still fails — copy the **same** SMTP variables into Render Environment, set `SMTP_PORT=465` and `SMTP_SECURE=true`, then **Manual Deploy**. Check spam folder for `murawaladenish@gmail.com`.

---

| Problem | Fix |
|---------|-----|
| Site empty / no products | Run `node seed.js` against production DB |
| Coupon invalid | Run `npm run seed:coupons` |
| API calls go to `localhost` | Set `VITE_BACKEND_URL` on Vercel, redeploy |
| Reset email link broken | Set `FRONTEND_URL` on Render (no trailing `/`) |
| 500 on cart/wishlist | Log in again (stale token after DB reset) |
| Render slow first load | Normal on free tier (cold start) |
| Admin routes 404 on refresh | Ensure `admin/vercel.json` exists and redeploy |
| Vercel build failed (red X) | Root Directory must be `frontend`, not repo root |

---

## 7. Local development

```bash
# backend/.env  — copy from backend/.env.example
# frontend/.env — VITE_BACKEND_URL=http://localhost:4000
# admin/.env    — VITE_BACKEND_URL=http://localhost:4000

cd backend && npm run server
cd frontend && npm run dev
cd admin && npm run dev
```
