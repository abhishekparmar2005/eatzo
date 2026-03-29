# 🍔 Eatzo — Local Food Delivery App

A full-stack food delivery web app built with React, Node.js, Express, and MongoDB.

---

## 📁 Project Structure

```
eatzo/
├── backend/                  # Node.js + Express API
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/          # Business logic
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   └── restaurantController.js
│   ├── middleware/
│   │   └── authMiddleware.js # JWT protect + adminOnly
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── Restaurant.js
│   │   ├── MenuItem.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── routes/               # Express routers
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── orderRoutes.js
│   │   └── restaurantRoutes.js
│   ├── seed.js               # Sample data seeder
│   ├── server.js             # App entry point
│   ├── .env.example          # Environment variables template
│   └── package.json
│
└── frontend/                 # React app
    ├── public/index.html
    └── src/
        ├── components/
        │   ├── Navbar.js
        │   ├── RestaurantCard.js
        │   └── MenuCard.js
        ├── context/
        │   ├── AuthContext.js
        │   └── CartContext.js
        ├── pages/
        │   ├── Home.js
        │   ├── RestaurantDetail.js
        │   ├── Cart.js
        │   ├── Auth.js
        │   ├── Orders.js
        │   └── AdminDashboard.js
        ├── utils/api.js
        ├── App.js
        ├── index.js
        └── index.css
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v16+
- MongoDB (local or MongoDB Atlas)
- npm

---

### 1. Clone / Extract the project

```bash
cd eatzo
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/eatzo
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

> **Using MongoDB Atlas?** Replace `MONGO_URI` with your Atlas connection string.

Seed the database with sample restaurants and menu items:
```bash
node seed.js
```

Start the backend:
```bash
npm run dev      # Development (with nodemon)
# or
npm start        # Production
```

Backend runs on **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000**

> The frontend proxies API requests to `http://localhost:5000` automatically (configured in `package.json`).

---

## 🔐 Demo Credentials (after seeding)

| Role  | Email               | Password  |
|-------|---------------------|-----------|
| Admin | admin@eatzo.com     | admin123  |
| User  | user@eatzo.com      | user123   |

---

## 🌐 API Reference

### Auth
| Method | Endpoint            | Access  | Description        |
|--------|---------------------|---------|--------------------|
| POST   | /api/auth/register  | Public  | Register new user  |
| POST   | /api/auth/login     | Public  | Login + get token  |
| GET    | /api/auth/me        | Private | Get current user   |

### Restaurants
| Method | Endpoint              | Access  | Description            |
|--------|-----------------------|---------|------------------------|
| GET    | /api/restaurants      | Public  | Get all restaurants    |
| GET    | /api/restaurants/:id  | Public  | Get one restaurant     |
| POST   | /api/restaurants      | Admin   | Create restaurant      |
| PUT    | /api/restaurants/:id  | Admin   | Update restaurant      |
| DELETE | /api/restaurants/:id  | Admin   | Delete restaurant      |

### Menu
| Method | Endpoint                         | Access  | Description          |
|--------|----------------------------------|---------|----------------------|
| GET    | /api/menu/restaurant/:id         | Public  | Get menu for restaurant |
| POST   | /api/menu                        | Admin   | Add menu item        |
| PUT    | /api/menu/:id                    | Admin   | Update menu item     |
| DELETE | /api/menu/:id                    | Admin   | Delete menu item     |

### Cart
| Method | Endpoint       | Access  | Description         |
|--------|----------------|---------|---------------------|
| GET    | /api/cart      | Private | Get user's cart     |
| POST   | /api/cart/add  | Private | Add item to cart    |
| PUT    | /api/cart/update | Private | Update quantity   |
| DELETE | /api/cart/clear | Private | Clear cart         |

### Orders
| Method | Endpoint               | Access  | Description             |
|--------|------------------------|---------|-------------------------|
| POST   | /api/orders            | Private | Place order             |
| GET    | /api/orders/my         | Private | Get my orders           |
| GET    | /api/orders/all        | Admin   | Get all orders          |
| PUT    | /api/orders/:id/status | Admin   | Update order status     |

---

## 🎨 Features

### User Features
- 🔐 Register / Login with JWT authentication
- 🏪 Browse restaurants with search
- 🍽️ View restaurant menu with categories (Veg/Non-veg filter)
- 🛒 Add to cart, update quantities, clear cart
- 📦 Place orders (COD)
- 📋 Track order status with progress bar

### Admin Features
- 🏪 Add / delete restaurants
- 🍔 Add / delete menu items per restaurant
- 📦 View all orders and update order status
- 📊 Basic stats dashboard

---

## 🛠️ Tech Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| Frontend   | React 18, Tailwind CSS      |
| Routing    | React Router v6             |
| HTTP       | Axios                       |
| Backend    | Node.js, Express            |
| Database   | MongoDB, Mongoose           |
| Auth       | JWT, bcryptjs               |
| Toasts     | react-hot-toast             |
| Fonts      | Poppins (Google Fonts)      |

---

## 🚀 Deploy to Production

### Backend (Render / Railway)
1. Push backend folder to GitHub
2. Set environment variables on your platform
3. Set start command: `node server.js`

### Frontend (Vercel / Netlify)
1. Update `src/utils/api.js` baseURL to your backend URL
2. Push frontend to GitHub and deploy

---

## 📝 Notes

- Cart is cleared automatically after order placement
- Adding items from a different restaurant clears the existing cart
- JWT tokens expire in 30 days
- All admin routes require `role: 'admin'` in the user document
