# Real Estate Property Management Platform

A full-stack web application for managing rental properties, leases, payments, and tenant-owner interactions in one place. The platform includes a React frontend and an Express/MongoDB backend with authentication, role-based access control, property management, lease handling, and payment integration.

## Overview

This project is designed for property owners and tenants to:
- Register and log in securely
- Manage rental properties
- Assign tenants to properties
- Create and manage leases
- Upload lease documents
- Record and verify payments
- View property and payment-related information through a dashboard

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Role-based access for owners and tenants

### Property Management
- Add, update, view, and delete properties
- Assign tenants to properties
- Property details and status tracking

### Lease Management
- Create lease records
- Upload lease documents
- View lease details

### Payments
- Create payment orders
- Verify payments
- Track payment records

### Dashboard UI
- Clean React-based user interface
- Navigation for properties, leases, payments, and account actions

## Tech Stack

### Frontend
- React
- Vite
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Razorpay integration
- Multer for file uploads

## Project Structure

```text
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  utils/
  server.js

rentflow/
  src/
    api/
    components/
    context/
    pages/
```

## Prerequisites

Before running the project, make sure you have:
- Node.js installed
- npm or yarn installed
- MongoDB running locally or a MongoDB Atlas connection string

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Hasini885/Real-estate-property-management.git
cd Real-estate-property-management
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../rentflow
npm install
```

## Environment Configuration

Create a `.env` file inside the `backend` folder with the following values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/real-estate-db
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret
```

### Notes
- Replace `MONGO_URI` with your MongoDB connection string.
- If you do not want to use Razorpay immediately, you can still run the app, but payment-related features will need valid credentials.

## Running the Application

### Start the backend

```bash
cd backend
npm run dev
```

The backend server will start on:
- http://localhost:5000

You can verify it by visiting:
- http://localhost:5000/test

### Start the frontend

In a separate terminal:

```bash
cd rentflow
npm run dev
```

The frontend will start on:
- http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`

### Properties
- `GET /api/properties`
- `POST /api/properties`
- `GET /api/properties/:id`
- `PUT /api/properties/:id`
- `DELETE /api/properties/:id`
- `PUT /api/properties/assign/:id`

### Leases
- `GET /api/leases`
- `GET /api/leases/:id`
- `POST /api/leases`
- `POST /api/leases/upload`

### Payments
- `GET /api/payments`
- `POST /api/payments`
- `POST /api/payments/create-order`
- `POST /api/payments/verify`

## Usage Guide

1. Start MongoDB.
2. Start the backend server.
3. Start the frontend development server.
4. Open the frontend in your browser.
5. Register a new account and log in.
6. Use the dashboard to manage properties, leases, and payments.

## Notes

- The frontend currently expects the backend at `http://localhost:5000`.
- If you deploy the backend to another host, update the API base URL in the frontend client configuration.
- File uploads are stored under the backend upload directory.
