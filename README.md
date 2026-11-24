# GYMKHANA — Premium Fitness & Nutrition Store

**GYMKHANA** is a modern fitness and nutrition ecommerce application designed to deliver a seamless online shopping experience for fitness enthusiasts.

The application features a customer-facing storefront and a dedicated admin dashboard for managing products, users, and orders.

Built with React, Redux Toolkit, and Supabase, the project focuses on responsive UI, centralized state management, secure authentication, and practical ecommerce functionality.

---

## Project Overview

GYMKHANA provides two separate experiences:

- **User Application** — Browse products, manage shopping carts and wishlists, place orders, and manage account information.
- **Admin Dashboard** — Manage products, monitor customers, and handle customer orders through a dedicated administrative interface.

---

## Features

### User Application

- Modern and responsive homepage
- Product listing and product details
- Product search and category browsing
- User registration and authentication
- Protected routes
- Shopping cart management
- Wishlist management
- Stock availability handling
- Checkout and order placement
- Order history
- User profile management
- Toast notifications
- Logout functionality

### Admin Dashboard

- Role-protected administrator access
- Protected admin routes
- Dashboard overview
- Product management (Create, Read, Update, Delete)
- Product inventory management
- Customer management
- User blocking and unblocking
- Order management
- Order details and status tracking
- Responsive admin interface

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend development |
| Vite | Development and build tool |
| JavaScript | Application logic |
| Redux Toolkit | Centralized state management |
| React Redux | Connecting React with Redux |
| React Router | Client-side routing |
| Supabase | Database, authentication, and row-level access control |
| Lucide React | Icons |
| CSS3 | Styling and responsive layouts |

---

## Project Architecture

The project follows a component-based architecture with centralized state management.

**Frontend**
- React components
- Reusable UI components
- User and admin pages
- Protected routing

**State Management**
- Redux Store
- Redux Slices
- Async Thunks
- Centralized application state

**Data Layer**
- Supabase Auth
- PostgreSQL tables protected by row-level security
- Transactional order and inventory operations

---

## Getting Started

Follow these steps to run GYMKHANA locally.

### 1. Clone the repository

```bash
git clone https://github.com/shaah-1/Gymkhana.git
```

### 2. Navigate to the project directory

```bash
cd Gymkhana
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create and configure Supabase

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql).
3. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Import the existing product catalog using the one-time instructions below.
5. In Supabase Authentication settings, configure the site URL and redirect URLs for your local Vite URL and deployed Vercel URL.
6. Create an account through the app. In the SQL Editor, promote that account to admin:

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'your-admin-email@example.com';
   ```

   Do not add a service-role key to the frontend or to a `VITE_` variable.

### 5. Import existing products once

Run this locally with the Supabase project URL and **service-role key** set only in your terminal environment. The hidden `read` keeps the key out of the command history; never commit or publish it:

```bash
export SUPABASE_URL="https://your-project.supabase.co"
printf "Paste the Supabase service-role key: "
read -s SUPABASE_SERVICE_ROLE_KEY
printf "\n"
export SUPABASE_SERVICE_ROLE_KEY
npm run import:products
unset SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY
```

This upserts products from `db.json` by product ID. It does not migrate accounts, passwords, carts, or orders. Customers must create new Supabase Auth accounts; existing order history stays in the old local JSON file. Do not copy that file wholesale because it contains account and order information.

### 6. Start the development server

Open another terminal in the project directory:

```bash
npm run dev
```

The application will run at the local URL displayed by Vite, usually:

```text
http://localhost:5173
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run import:products` | Import the existing catalog into Supabase (one time) |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Deployment

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the Vercel project's Environment Variables for each deployment environment, then redeploy. The publishable key is intended for browser use; database access is controlled by the policies in `supabase/schema.sql`.

---

## Design Philosophy

GYMKHANA follows a clean and minimal design approach.

- Minimal black and white color palette
- Consistent typography
- Responsive layouts
- Reusable components
- Clear navigation
- User-friendly interactions

The goal is to combine a premium fitness brand identity with a simple and functional ecommerce experience.

---

## Learning Outcomes

Through this project, I explored and implemented:

- Component-based architecture using React
- Centralized state management with Redux Toolkit
- Supabase PostgreSQL queries and row-level security
- Authentication and protected routing
- CRUD operations
- Ecommerce cart and wishlist functionality
- User and admin role separation
- Responsive UI development
- Frontend and Supabase integration

---

## Future Improvements

- Online payment gateway integration
- Enhanced inventory reporting
- Email notifications

---

## Author

**Shahid**

Frontend Developer | React Developer

GitHub: https://github.com/shaah-1

---

*GYMKHANA — Train Harder. Live Stronger.*
