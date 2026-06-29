# Pizza Teo

## Overview

**Pizza Teo** is a full-stack food ordering platform inspired by modern restaurant delivery systems. The application provides a seamless experience for customers to browse menu items, order pizzas and combos, earn reward points, and complete payments through multiple payment gateways.

The platform supports two roles: **Customer** and **Administrator**.

Customers can place delivery or takeaway orders, track their order status, manage their profiles, and redeem reward points for discounts. Administrators can manage products, categories, combo meals, banners, users, and orders through a dedicated management dashboard.

**🗓️ Project created on:** May 13, 2024

---

## Demo

**Website:** [PizzaTeo Demo](https://pizzateo.vercel.app)

---

## Technologies & Libraries

### Frontend

- Next.js 14
- React 18
- Tailwind CSS
- Swiper.js
- React Icons
- Framer Motion
- React Hot Toast
- Next Intl (i18n)

### Backend & Database

- MongoDB
- Mongoose
- NextAuth.js
- bcrypt
- MongoDB Adapter

### Payments

- Stripe
- PayPal
- MoMo
- ZaloPay
- Cash on Delivery (COD)

### Maps & Location

- OpenStreetMap Nominatim
- Leaflet.js

### Real-time Features

- Pusher
- Pusher JS

### Utilities

- Nodemailer
- Moment.js
- FormData
- React Google reCAPTCHA
- uniqid
- Eruda

### Data Visualization

- Recharts

### Drag & Drop

- @dnd-kit/core
- @dnd-kit/sortable
- @dnd-kit/utilities

---

## System Design

### Customer Flow

Customer
→ Browse Menu
→ Add To Cart
→ Checkout
→ Payment Gateway
→ Order Created
→ Real-time Notification
→ Order Tracking

### Admin Flow

Admin
→ Manage Products
→ Manage Categories
→ Manage Orders
→ Update Order Status
→ Notify Customer

## Pages

### Customer Pages

- Home Page
- Login Page
- Register Page
- Forgot Password Page
- Reset Password Page
- Cart Page
- Checkout Page
- Combo Order Page
- Rewards Page
- Profile Page
- Notification Page
- Change Password Page
- Order tracking Page

### Admin Pages

- Manage Banners
- Manage Categories
- Manage Menu Items
- Create Menu Item
- Edit Menu Item
- Manage Combo Types
- Create Combo Type
- Edit Combo Type
- Manage Combos
- Create Combo
- Edit Combo
- Manage Users
- Edit User
- Manage Orders
- Order Detail
- Rearrange Sections
- Dashboard Page

---

## Main Features

### Authentication

- Email & password authentication
- Google Sign-In integration
- Protected routes based on user roles

### Product Management

- Browse menu items and combo meals
- Search products
- Category-based filtering
- Product recommendations based on similar menu categories

### Shopping Cart

- Add individual menu items
- Add combo meals
- Quantity management
- Dynamic price calculation

### Order System

- Delivery orders
- Takeaway orders
- Order tracking with status updates
- Order cancellation under allowed conditions

### Payment Integration

- Cash on Delivery (COD)
- Stripe Payment Gateway
- PayPal Payment Gateway
- MoMo Payment Gateway
- ZaloPay Payment Gateway

### Reward Points System

- Earn points after successful purchases
- Redeem points for discounts on future orders
- Loyalty program integration

### Account Management

- Update personal information
- Change password
- Password reset via email
- Google account support

### Internationalization

- English language support
- Vietnamese language support

---

## Admin Features

### Banner Management

- Create, update, activate, deactivate, and delete banners

### Category Management

- Full CRUD operations
- Search and sorting support

### Menu Item Management

- Full CRUD operations
- Product visibility control

### Combo Management

- Manage combo categories
- Create and edit combo meals
- Full CRUD operations

### User Management

- Search and manage users
- Block or unblock accounts

### Order Management

- View order details
- Update order status workflow

Order statuses include:

- Pending
- Confirmed
- Preparing
- Delivering
- Completed
- Cancelled

### Content Arrangement

- Drag-and-drop section ordering
- Dynamic homepage management

### Dashboard & Analytics

Built with Recharts for interactive data visualization:

- Total revenue, total orders, total customers, total pizza/items sold, total combos sold
- Monthly revenue trend (Line Chart)
- Top 5 best-selling products — pizzas, single items, and combos (Bar Chart)
- Order status distribution (Pie Chart)
- Latest orders table
- Filter by order status and by month

---

## System Features

### Email Notifications

Using Nodemailer for:

- Order confirmation emails
- Password reset emails
- System notifications

### Real-Time Notifications

Using Pusher for:

- New order notifications
- Order status updates
- Admin and customer notifications

### Smart Delivery Calculation

- Uses map coordinates to determine the nearest restaurant branch
- Calculates delivery fees based on route distance

### Infinite Scrolling & Pagination

- Optimized product browsing experience
- Improved performance for large datasets

### Active / Inactive Controls

Administrators can enable or disable:

- Menu items
- Categories
- Combos
- Combo Types
- Banners

### Security

- Password hashing with bcrypt
- Google reCAPTCHA integration
- Role-based authorization

---

## Project Highlights

- Full-stack food ordering platform
- Multiple payment gateway integrations
- Real-time order tracking
- Reward points and loyalty system
- Delivery and takeaway workflows
- Internationalization (EN / VI)
- Responsive design for desktop and mobile devices
- Admin dashboard with advanced management features

---

## Testing:

- Tài khoản admin test: admin@gmail.com pass Admin123@
- Paypal sb: sb-rqczv51529184@personal.example.com dG=iQtv1
- Momo sb: NGUYEN VAN A 9704 0000 0000 0018 03/07 OTP
- Zalopay sb: 4111111111111111 NGUYEN VAN A 01/28 123
- Stripe: 4242 4242 4242 4242 - 04 / 26 (Change date by year) - 424 - 24242

## Future Improvements

- Mobile App
- Analytics Dashboard
- AI Product Recommendation

## Screenshots

![Overview Page](bg_info.png)
