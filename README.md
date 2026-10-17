# Retain App

Retain App is a full-stack personal expense tracking and budgeting application. It helps users manage categories, record expenses, monitor budgets, and review spending trends from a React frontend backed by an Express API and PostgreSQL database.

## Features

- User authentication and protected routes
- Expense tracking with filters and detail views
- Budget management and monitoring
- Category management
- Admin dashboard for managing users and expenses
- Responsive dashboard UI for overview insights

## Tech Stack

- Frontend: React + TypeScript + Vite
- State management: Redux Toolkit
- API client: Axios
- Backend: Node.js + Express
- Database: PostgreSQL
- Authentication: JWT + bcrypt

## Repository Structure

```text
Retain-App/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── .env
│   ├── db.js
│   ├── middleware.js
│   ├── package.json
│   ├── schema.sql
│   └── server.js
├── frontend/
│   ├── src/
│   ├── .env
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
├── .git/
└── README.md
```

## Prerequisites

Before running the project, make sure you have:

- Node.js 18+ and npm
- PostgreSQL running locally or on a reachable server
- A database created for the app (for example: `retain`)

## Backend Setup

1. Open a terminal in the backend folder:

```bash
cd backend
npm install
```

2. Create or update the backend environment file:

```env
DB_USER=retain_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=retain
PORT=5000
CLIENT_URL=http://localhost:5173
```

3. Start the API server:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

The server will automatically initialize the PostgreSQL schema if required via the SQL file in `backend/schema.sql`.

## Frontend Setup

1. Open a terminal in the frontend folder:

```bash
cd frontend
npm install
```

2. Create or update the frontend environment file:

```env
VITE_API_URL=http://localhost:5000/api
```

3. Start the app:

```bash
npm run dev
```

The frontend typically runs on:

```text
http://localhost:5173
```

## Useful Scripts

### Backend

```bash
cd backend
npm run dev   # runs the server with nodemon
npm start     # runs the server with Node
npm test      # runs project tests
```

### Frontend

```bash
cd frontend
npm run dev   # starts the Vite development server
npm run build # creates a production build
npm run lint  # runs the linter
npm run preview # previews the production build
```

## API Base URL

The frontend sends requests to:

```text
http://localhost:5000/api
```

## Deployment

### 1. Prepare the backend for production

Set the backend environment variables in a production environment such as Render, Railway, Fly.io, or a VPS:

```env
DB_USER=retain_user
DB_PASSWORD=your_secure_password
DB_HOST=your_database_host
DB_PORT=5432
DB_DATABASE=retain
PORT=5000
CLIENT_URL=https://your-frontend-domain.com
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

Then start the API in production mode:

```bash
cd backend
npm install
npm start
```

The Express server listens on the configured `PORT` and serves the API under `/api` routes.

### 2. Prepare the frontend for production

Update the frontend environment variable to point to the deployed backend API:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

Build the frontend:

```bash
cd frontend
npm install
npm run build
```

This produces the static files in the `frontend/dist` directory.

### 3. Deploy the frontend

You can deploy the frontend in several ways:

- Vercel
- Netlify
- GitHub Pages
- any static hosting provider
- a Node/Nginx server serving the contents of `frontend/dist`

For a basic static hosting setup:

```bash
cd frontend
npm run build
```

Upload the generated `dist` folder to your hosting provider.

### 4. Deploy the backend

For the backend, deploy the `backend` directory as a Node.js app. Make sure your hosting platform installs dependencies and runs:

```bash
npm install
npm start
```

### 5. Recommended production setup

- Use HTTPS for both frontend and backend domains.
- Keep database credentials in environment variables, not in source control.
- Use a strong JWT secret.
- Configure your database to allow connections from the deployment environment.
- If using a reverse proxy, route `/api` requests to the backend service and serve the frontend for the root domain.

## Notes

- The backend uses CORS configuration with `CLIENT_URL` and defaults to `http://localhost:5173`.
- The frontend requires `VITE_API_URL` to be defined before the app can load.
- Admin and authenticated routes rely on JWT tokens stored in browser local storage.

## Contributing

1. Create a feature branch.
2. Make your changes.
3. Run the relevant build or validation commands.
4. Submit a pull request with a clear summary.

## License

This project is currently unlicensed unless added later by the project owner.
