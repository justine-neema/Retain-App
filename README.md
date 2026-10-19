# Retain App

# Live demo: https://retain-app-flax.vercel.app/

Retain is a full-stack personal expense and budget manager built with React + TypeScript on the frontend and a Node.js/Express backend with PostgreSQL. The application allows users to manage expenses, track monthly budgets, view dashboard insights, and access an admin overview for platform-level analytics.

## Project Goal

This project was designed to satisfy the summative requirement for a personal expense management system. It focuses on:

- recording and managing personal expenses
- filtering and searching by date, category, payment method, and text
- setting and monitoring monthly budgets
- viewing summary and dashboard information
- protecting user data using authentication and authorization
- enabling admin-only analytics and category management

## Main Features

- User sign up, login, logout, and protected route handling
- Expense CRUD operations with filters and sorting
- Monthly budget tracking with remaining amount and budget status
- Dashboard overview for monthly spending and recent activity
- Category management for organizing expenses
- Admin dashboard with user and expense insights
- Responsive interface for desktop and mobile usage

## Technologies Used

### Frontend
- React
- TypeScript
- Vite
- Redux Toolkit
- React Router
- Axios
- Recharts

### Backend
- Node.js
- Express
- PostgreSQL
- JWT authentication
- bcryptjs
- dotenv
- CORS

## Project Structure

```text
Retain-App/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── db.js
│   ├── middleware.js
│   ├── package.json
│   ├── schema.sql
│   └── server.js
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
├── README.md
└── LICENSE
```

## Architecture Overview

### Frontend
The frontend is built with React and TypeScript. It handles:

- authentication state with React Context
- route guarding using protected route components
- Redux-managed search, sorting, and filtering logic
- UI rendering for expenses, dashboard, budgets, and admin views

### Backend
The backend is built with Express and uses PostgreSQL for persistent storage. It exposes RESTful API routes for:

- authentication
- expenses
- budgets
- categories
- admin analytics

## Prerequisites

Before running locally, ensure you have:

- Node.js 18+
- npm
- PostgreSQL installed and running
- A database created for the app, eg. `retain`

## Local Setup

### 1) Clone the repo

```bash
git clone <repository-url>
cd Retain-App
```

### 2) Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:

```env
DB_USER=retain_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=retain
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

Start the API:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### 3) Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` with:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the app:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Local Development Notes

- Start the backend before the frontend.
- Use the frontend to sign up or sign in.
- Admin-only features require an account with the `ADMIN` role.
- The app depends on a PostgreSQL database and JWT-based authentication.

## API Documentation

For the complete API reference, see [API.md](API.md).

## Deployment

The app is currently deployed here:

https://retain-app-flax.vercel.app/

For deployment, the frontend should point to the backend API using `VITE_API_URL`, and the backend should be configured with secure production environment values for the database, JWT secret, and CORS origin.

## Notes

- PostgreSQL is the main persistence layer.
- Database initialization runs during backend startup.
- Auth is protected using JWT middleware.
- Admin functionality is restricted to users with the `ADMIN` role.
- The app follows a modular structure separating frontend and backend responsibilities.

## License

This project is licensed under the MIT License.
