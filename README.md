# WishWise – Intelligent Wishlist & Favourites Management Platform

WishWise is a production-structured, database-backed full-stack e-commerce Wishlist & Favourites Management System built with **Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, React 18, Vite, Tailwind CSS, TanStack Query, Zustand, Recharts, and Lucide React**.

Rather than basic CRUD wishlist saving, WishWise provides an intelligent decision-support engine featuring price drop tracking, stock monitoring, target price notifications, dynamic Wishlist Health Scores, monthly Budget Planning, collaborative gift wishlists with duplicate gift prevention, AI wishlist assistance, and administrative Demand Intelligence analytics.

---

## 🌟 Key Features

### Customer Features
- 🛒 **Full E-Commerce Catalogue**: Browse products, search keywords, filter by category/brand/price/availability, sort by discount/popularity/rating.
- ❤️ **Persistent Multi-Wishlist Engine**: Create custom wishlists ("Personal Favorites ❤️", "Gaming Setup 🎮", "College 💻", "Birthday 🎁").
- 🎯 **Target Price Alerts**: Set custom target prices for products and receive automatic notifications when current prices drop to or below target.
- 🔴 **Priority Management**: Assign priorities (`Must Buy 🔴`, `High 🟠`, `Medium 🟡`, `Low 🟢`) and auto-sort items.
- 📊 **Price History & Trend Graphs**: Visual Recharts price history tracking recorded price changes over time.
- 🛡️ **Wishlist Health Score**: Calculated health index (0–100%) evaluating stock availability, target price status, discount deals, and stale items.
- 💰 **Wishlist Budget Planner**: Interactive monthly budget solver that ranks and suggests optimal purchase candidates within budget bounds.
- 👥 **Collaborative Wishlists**: Invite friends/family via email or share links with permission controls (`VIEW`, `SUGGEST`, `COMMENT`, `MANAGE`).
- 🎁 **Duplicate Gift Prevention**: Members can flag "Planning to Buy" to prevent duplicate purchasing intentions.
- 🤖 **AI Wishlist Assistant**: Context-aware AI assistant (`/assistant` & floating drawer) providing explainable purchase advice for any budget.
- ⚖️ **Product Comparison Matrix**: Compare technical specifications, prices, ratings, and stock status side-by-side for up to 4 products.
- 🔔 **Smart Notification Center**: Filterable in-app notification alerts for price drops, target prices met, low stock, back in stock, and stale items (>90 days).
- 🛍️ **Cart & Orders**: Seamless wishlist-to-cart transfer with stock verification and checkout workflow.

### Admin & Manager Features
- 👑 **Role-Based Access Control (RBAC)**: Distinct permissions for `CUSTOMER`, `MANAGER`, and `ADMIN`.
- 📊 **Executive Dashboard**: Real-time KPI cards for Total Users, Wishlists, Revenue, and Wishlist-to-Cart conversion rate.
- 📦 **Product & Inventory Management**: Product CRUD, pricing updates, stock quantity adjustments, low-stock threshold triggers.
- 🔥 **Demand Intelligence Matrix**: High wishlist demand vs low stock matrix highlighting critical restock items.
- 🏆 **Most Wanted Products Report**: Aggregate ranking of most wishlisted items across categories.
- 👥 **User Role Management**: Manage accounts and promote/demote roles.
- 🛡️ **Security Audit Logs**: Comprehensive security trail tracking administrative modifications.

---

## 🏗️ Architecture & Stack

### Backend (`/backend`)
- **Runtime**: Node.js + Express.js + TypeScript
- **Database & ORM**: PostgreSQL + Prisma ORM
- **Auth**: JWT Access + Refresh Tokens, bcrypt password hashing, RBAC middlewares
- **Documentation**: Swagger OpenAPI 3.0 at `http://localhost:5000/api-docs`
- **Background Jobs**: Node-Cron / interval scanner checking target prices, stock changes, and stale wishlist items
- **Testing**: Jest + Supertest (8 passed API integration tests)

### Frontend (`/frontend`)
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide React Icons
- **State Management**: Zustand stores (`useAuthStore`, `useWishlistStore`, `useCartStore`) + TanStack Query
- **Charts**: Recharts (price history area charts)
- **HTTP Client**: Axios with Bearer token request/response interceptors

---

## 🛠️ Quick Start & Local Setup

### Prerequisites
- Node.js v18+ and npm
- PostgreSQL database server running on `localhost:5432`

### 1. Database Setup
Ensure PostgreSQL is running and update `backend/.env` with your database connection credentials:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wishwise?schema=public"
JWT_SECRET="wishwise_super_secret_jwt_key_2026"
JWT_REFRESH_SECRET="wishwise_super_secret_refresh_jwt_key_2026"
CLIENT_URL="http://localhost:5173"
```

### 2. Backend Setup & Seeding
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed
npm test
npm run dev
```
*The seed script populates 15 products with price histories, inventories, categories, wishlists, collaborative items, notifications, and 4 test accounts.*

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run build
npm run dev
```

The application will be accessible at: `http://localhost:5173`
Backend Swagger API docs: `http://localhost:5000/api-docs`

---

## 🔑 Demo Test Accounts

You can use the one-click demo login buttons on the Login page (`/login`), or enter credentials manually:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Customer** | `customer@wishwise.com` | `customer123` | Browse, Wishlists, Target Prices, Budget Planner, Compare, Cart, Checkout |
| **Collaborator** | `collaborator@wishwise.com` | `customer123` | Shared wishlist member, Gift prevention |
| **Manager** | `manager@wishwise.com` | `manager123` | Product management, Inventory, Demand Intelligence |
| **Admin** | `admin@wishwise.com` | `admin123` | Executive Dashboard, User Management, Audit Logs, All Manager rights |

---

## 🧪 Verification & Test Commands

- **Backend Integration Tests**: `cd backend && npm test`
- **Backend Type Check**: `cd backend && npx tsc --noEmit`
- **Frontend Type Check & Build**: `cd frontend && npm run build`
- **Prisma Schema Validation**: `cd backend && npx prisma validate`

---
## Screenshots

### Splash Screen
<img src="./screenshots/splashscreen" width="900">

### Cart
<img src="./screenshots/cart" width="900">

### Dashboard
<img src="./screenshots/dashboard" width="900">

## 🚀 Deployment

- **Frontend**: Compatible with Vercel or Netlify (Vite build output in `frontend/dist`).
- **Backend**: Compatible with Render, Railway, or Node hosts (`backend/dist/app.js`).
- **Database**: Compatible with Supabase, Neon, Railway, or managed PostgreSQL.
