# GYMKHANA — Premium Fitness & Nutrition Store

**GYMKHANA** is a modern fitness and nutrition ecommerce application designed to deliver a seamless online shopping experience for fitness enthusiasts.

The application features a customer-facing storefront and a dedicated admin dashboard for managing products, users, and orders.

Built with React, Redux Toolkit, and JSON Server, the project focuses on responsive UI, centralized state management, API integration, and practical ecommerce functionality.

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

- Separate admin authentication
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
| Axios | API communication |
| JSON Server | REST API and data storage |
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

**API Layer**
- Axios services
- JSON Server
- REST API operations

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

### 4. Start the JSON Server

Open a terminal and run:

```bash
npm run server
```

The API server will run at:

```text
http://localhost:3000
```

### 5. Start the development server

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
| `npm run server` | Start JSON Server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## API Resources

The application uses JSON Server to provide REST API functionality.

Main resources include:

- `/products`
- `/users`
- `/orders`

Additional resources used by the application include cart and wishlist data.

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
- REST API integration using Axios
- Authentication and protected routing
- CRUD operations
- Ecommerce cart and wishlist functionality
- User and admin role separation
- Responsive UI development
- Frontend and API integration

---

## Future Improvements

- Online payment gateway integration
- Advanced sales analytics
- Enhanced inventory reporting
- Email notifications
- Improved authentication security
- Production backend integration

---

## Author

**Shahid**

Frontend Developer | React Developer

GitHub: https://github.com/shaah-1

---

*GYMKHANA — Train Harder. Live Stronger.*
