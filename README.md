# 🍔 Eatzo — Local Food Delivery Web App

A full-stack food delivery platform inspired by Swiggy/Zomato, built for local restaurant ecosystems.
Eatzo allows users to browse restaurants, order food, and track deliveries, while admins manage menus and orders.

---

## 🚀 Live Demo

👉 https://eatzo-seven.vercel.app/

---

## ✨ Features

### 👤 User Features

* 🔐 JWT-based Authentication (Register/Login)
* 🏪 Browse local restaurants
* 🍽️ View menus with categories & filters
* 🛒 Add to cart & manage quantities
* 💳 Place orders (COD + UPI flow)
* 📦 Track order status (real-time UI updates)
* 📱 Mobile-friendly responsive design

---

### 🛠️ Admin Features

* ➕ Add / delete restaurants
* 🍔 Add menu items (with variants like Half/Full)
* 📦 Manage all orders
* 💰 Verify UPI payments manually
* 🚨 Detect suspicious/fake payments
* 📊 Dashboard with stats

---

## 🧠 Key Highlights

* ⚡ Full-stack MERN architecture
* 🔄 Real-world order lifecycle (Placed → Delivered)
* 💳 Custom UPI payment flow with verification
* 🧩 Modular and scalable code structure
* 🎯 Built with production-level thinking (UX + logic)

---

## 🏗️ Tech Stack

| Layer       | Technology             |
| ----------- | ---------------------- |
| Frontend    | React 18, Tailwind CSS |
| Routing     | React Router v6        |
| Backend     | Node.js, Express       |
| Database    | MongoDB, Mongoose      |
| Auth        | JWT, bcryptjs          |
| API Client  | Axios                  |
| UI Feedback | react-hot-toast        |

---

## 📁 Project Structure

```
eatzo/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed.js
│   └── server.js
│
└── frontend/
    ├── public/
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        ├── utils/
        ├── App.js
        └── index.js
```

---

## ⚙️ Installation & Setup

### 📌 Prerequisites

* Node.js (v16+)
* MongoDB (Local / Atlas)
* npm

---

### 🔧 Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env`:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
NODE_ENV=development
```

Seed database:

```bash
node seed.js
```

Run backend:

```bash
npm run dev
```

---

### 💻 Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on:
👉 http://localhost:3000

Backend runs on:
👉 http://localhost:5000

---

## 🔐 Demo Credentials

| Role  | Email                                     | Password |
| ----- | ----------------------------------------- | -------- |
| User  | [user@eatzo.com](mailto:user@eatzo.com)   | user123  |

---

## 🌐 API Overview

### Auth

* POST `/api/auth/register`
* POST `/api/auth/login`
* GET `/api/auth/me`

### Restaurants

* GET `/api/restaurants`
* POST `/api/restaurants` (Admin)

### Menu

* GET `/api/menu/restaurant/:id`
* POST `/api/menu` (Admin)

### Cart

* GET `/api/cart`
* POST `/api/cart/add`

### Orders

* POST `/api/orders`
* GET `/api/orders/my`
* GET `/api/orders/all` (Admin)

---

## 💳 Payment System

* Supports:

  * Cash on Delivery (COD)
  * UPI (manual verification)
* Includes:

  * QR Code payment
  * UTR tracking
  * Fake payment detection
  * Admin approval system

---

## 📦 Order Flow

```
Placed → Confirmed → Preparing → Out for Delivery → Delivered
```

---

## 🚀 Deployment

### Backend

* Deploy on Render / Railway
* Set environment variables
* Start command: `node server.js`

### Frontend

* Deploy on Vercel / Netlify
* Update API base URL

---

## 📌 Future Improvements

* 📍 Live delivery tracking (maps)
* 🔔 Push notifications
* 🧑‍🍳 Restaurant owner dashboard
* 💳 Razorpay/Stripe integration
* 📊 Advanced analytics

---

## 👨‍💻 Author

**Abhishek Thakur**
BTech CSE Student | Full Stack Developer

---

## ⭐ If you like this project

Give it a star ⭐ and feel free to contribute!

---

