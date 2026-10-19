# Retain API Documentation

This document describes the backend API used by the Retain app.

## Base URL

```text
http://localhost:5000/api
```

If you are running the frontend locally, it typically connects using the environment variable `VITE_API_URL` set to the same base URL.

## Authentication

All user-protected routes require a JWT in the Authorization header:

```http
Authorization: Bearer <token>
```

The token is returned by the auth endpoints after signup or login and is stored in the browser as `retain_token`.

### 1) Signup

#### `POST /api/auth/signup`
Creates a new user account and returns a JWT token.

Request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

Success response: `201 Created`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "5a2c4f4e-7f8e-48fc-881d-4d943a4af861",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "USER"
  }
}
```

Validation errors:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Password must be at least 6 characters"
}
```

### 2) Login

#### `POST /api/auth/login`
Logs in an existing user.

Request body:

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

Success response: `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "5a2c4f4e-7f8e-48fc-881d-4d943a4af861",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "USER"
  }
}
```

### 3) Get current user

#### `GET /api/auth/me`
Returns the authenticated user profile.

Headers:

```http
Authorization: Bearer <token>
```

Success response:

```json
{
  "user": {
    "id": "5a2c4f4e-7f8e-48fc-881d-4d943a4af861",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "USER"
  }
}
```

---

## Categories

### `GET /api/categories`
Returns all categories available to the authenticated user.

Headers:

```http
Authorization: Bearer <token>
```

Success response:

```json
{
  "categories": [
    {
      "id": "8f46d035-1d76-4bd6-bae7-0bcc494b5b34",
      "name": "Food",
      "icon": "",
      "color": "#10b981",
      "isDefault": false
    },
    {
      "id": "7d74a63e-f867-4d1c-9319-a8998a9db1d4",
      "name": "Transport",
      "icon": "",
      "color": "#3b82f6",
      "isDefault": false
    }
  ]
}
```

---

## Expenses

Expense objects use this shape:

```json
{
  "id": "ab10b2f1-2df7-48ad-9e06-fd4759d4c98c",
  "userId": "5a2c4f4e-7f8e-48fc-881d-4d943a4af861",
  "title": "Groceries",
  "amount": 3500,
  "categoryId": "8f46d035-1d76-4bd6-bae7-0bcc494b5b34",
  "categoryName": "Food",
  "categoryColor": "#10b981",
  "categoryIcon": "",
  "date": "2026-10-19",
  "paymentMethod": "cash",
  "notes": "Monthly food shopping",
  "createdAt": "2026-10-19T08:30:00.000Z",
  "updatedAt": "2026-10-19T08:30:00.000Z"
}
```

Allowed payment method values:

- `cash`
- `transfer`
- `card`
- `mobile`
- `other`

### 1) List all expenses

#### `GET /api/expenses`
Returns all expenses for the current user, sorted by most recent date first.

Success response:

```json
{
  "expenses": [
    {
      "id": "ab10b2f1-2df7-48ad-9e06-fd4759d4c98c",
      "userId": "5a2c4f4e-7f8e-48fc-881d-4d943a4af861",
      "title": "Groceries",
      "amount": 3500,
      "categoryId": "8f46d035-1d76-4bd6-bae7-0bcc494b5b34",
      "categoryName": "Food",
      "categoryColor": "#10b981",
      "categoryIcon": ""      "date": "2026-10-19",
      "paymentMethod": "cash",
      "notes": "Monthly food shopping",
      "createdAt": "2026-10-19T08:30:00.000Z",
      "updatedAt": "2026-10-19T08:30:00.000Z"
    }
  ]
}
```

### 2) Get a single expense

#### `GET /api/expenses/:id`
Returns one expense, only if it belongs to the authenticated user.

Success response:

```json
{
  "expense": {
    "id": "ab10b2f1-2df7-48ad-9e06-fd4759d4c98c",
    "userId": "5a2c4f4e-7f8e-48fc-881d-4d943a4af861",
    "title": "Groceries",
    "amount": 3500,
    "categoryId": "8f46d035-1d76-4bd6-bae7-0bcc494b5b34",
    "categoryName": "Food",
    "categoryColor": "#10b981",
    "categoryIcon": "",
    "date": "2026-10-19",
    "paymentMethod": "cash",
    "notes": "Monthly food shopping",
    "createdAt": "2026-10-19T08:30:00.000Z",
    "updatedAt": "2026-10-19T08:30:00.000Z"
  }
}
```

Not found response:

```json
{
  "error": "EXPENSE_NOT_FOUND",
  "message": "Expense not found"
}
```

### 3) Create expense

#### `POST /api/expenses`
Creates a new expense for the authenticated user.

Request body:

```json
{
  "title": "Groceries",
  "amount": 3500,
  "categoryId": "8f46d035-1d76-4bd6-bae7-0bcc494b5b34",
  "date": "2026-10-19",
  "paymentMethod": "cash",
  "notes": "Monthly food shopping"
}
```

Validation rules:

- `title` is required and max 200 characters
- `amount` must be a number greater than or equal to 0
- `categoryId` must be a valid UUID
- `date` must be a valid date string
- `paymentMethod` is required
- `notes` is optional

Success response: `201 Created`

```json
{
  "expense": {
    "id": "ab10b2f1-2df7-48ad-9e06-fd4759d4c98c",
    "userId": "5a2c4f4e-7f8e-48fc-881d-4d943a4af861",
    "title": "Groceries",
    "amount": 3500,
    "categoryId": "8f46d035-1d76-4bd6-bae7-0bcc494b5b34",
    "categoryName": "Food",
    "categoryColor": "#10b981",
    "categoryIcon": "",
    "date": "2026-10-19",
    "paymentMethod": "cash",
    "notes": "Monthly food shopping",
    "createdAt": "2026-10-19T08:30:00.000Z",
    "updatedAt": "2026-10-19T08:30:00.000Z"
  }
}
```

### 4) Update expense

#### `PUT /api/expenses/:id`
Updates an expense owned by the current user.

Request body is the same as create.

Success response:

```json
{
  "expense": {
    "id": "ab10b2f1-2df7-48ad-9e06-fd4759d4c98c",
    "userId": "5a2c4f4e-7f8e-48fc-881d-4d943a4af861",
    "title": "Groceries + household",
    "amount": 4200,
    "categoryId": "8f46d035-1d76-4bd6-bae7-0bcc494b5b34",
    "categoryName": "Food",
    "categoryColor": "#10b981",
    "categoryIcon": "",
    "date": "2026-10-19",
    "paymentMethod": "card",
    "notes": "Household restock",
    "createdAt": "2026-10-19T08:30:00.000Z",
    "updatedAt": "2026-10-20T09:00:00.000Z"
  }
}
```

### 5) Delete expense

#### `DELETE /api/expenses/:id`
Deletes an expense belonging to the current user.

Success response:

```json
{
  "success": true,
  "deletedId": "ab10b2f1-2df7-48ad-9e06-fd4759d4c98c"
}
```

### 6) Expense summary

#### `GET /api/expenses/summary`
Returns a summary for the current month, including totals and recent spending.

Optional query param:

```text
month=YYYY-MM
```

Example:

```text
GET /api/expenses/summary?month=2026-10
```

Success response:

```json
{
  "month": "2026-10",
  "totalSpent": 125000,
  "monthlyBudget": 200000,
  "remainingBudget": 75000,
  "highestExpense": {
    "id": "ab10b2f1-2df7-48ad-9e06-fd4759d4c98c",
    "title": "Groceries",
    "amount": 3500,
    "date": "2026-10-19"
  },
  "byCategory": [
    {
      "category": "Food",
      "total": 50000,
      "color": "#10b981",
      "icon": ""
    }
  ],
  "recentExpenses": [
    {
      "id": "ab10b2f1-2df7-48ad-9e06-fd4759d4c98c",
      "userId": "5a2c4f4e-7f8e-48fc-881d-4d943a4af861",
      "title": "Groceries",
      "amount": 3500,
      "categoryId": "8f46d035-1d76-4bd6-bae7-0bcc494b5b34",
      "categoryName": "Food",
      "categoryColor": "#10b981",
      "categoryIcon": "",
      "date": "2026-10-19",
      "paymentMethod": "cash",
      "notes": "Monthly food shopping",
      "createdAt": "2026-10-19T08:30:00.000Z",
      "updatedAt": "2026-10-19T08:30:00.000Z"
    }
  ]
}
```

### 7) Dashboard metrics

#### `GET /api/expenses/dashboard`
Returns dashboard totals and recent expenses for the current user.

Optional query param:

```text
month=YYYY-MM
```

Success response:

```json
{
  "month": "2026-10",
  "totalSpentThisMonth": 125000,
  "totalSpentAllTime": 520000,
  "highestExpense": 3500,
  "monthlyBudget": 200000,
  "recentExpenses": [
    {
      "id": "ab10b2f1-2df7-48ad-9e06-fd4759d4c98c",
      "userId": "5a2c4f4e-7f8e-48fc-881d-4d943a4af861",
      "title": "Groceries",
      "amount": 3500,
      "categoryId": "8f46d035-1d76-4bd6-bae7-0bcc494b5b34",
      "categoryName": "Food",
      "categoryColor": "#10b981",
      "categoryIcon": "",
      "date": "2026-10-19",
      "paymentMethod": "cash",
      "notes": "Monthly food shopping",
      "createdAt": "2026-10-19T08:30:00.000Z",
      "updatedAt": "2026-10-19T08:30:00.000Z"
    }
  ],
  "spendingByCategory": [
    {
      "category": "Food",
      "total": 50000,
      "color": "#10b981",
      "icon": ""
    }
  ]
}
```

### 8) Search and filter expenses

#### `GET /api/expenses/search`
Returns filtered, sorted, and paginated results for the authenticated user.

Query parameters:

```text
q            Search text across title and notes
categoryId   UUID of a category
paymentMethod cash|transfer|card|mobile|other
startDate    YYYY-MM-DD
endDate      YYYY-MM-DD
sortBy       date|amount|title|createdAt
order        asc|desc
page         integer, default 1
limit        integer, default 20, max 100
```

Example:

```text
GET /api/expenses/search?q=food&categoryId=8f46d035-1d76-4bd6-bae7-0bcc494b5b34&paymentMethod=cash&startDate=2026-10-01&endDate=2026-10-31&sortBy=date&order=desc&page=1&limit=10
```

Success response:

```json
{
  "expenses": [
    {
      "id": "ab10b2f1-2df7-48ad-9e06-fd4759d4c98c",
      "userId": "5a2c4f4e-7f8e-48fc-881d-4d943a4af861",
      "title": "Groceries",
      "amount": 3500,
      "categoryId": "8f46d035-1d76-4bd6-bae7-0bcc494b5b34",
      "categoryName": "Food",
      "categoryColor": "#10b981",
      "categoryIcon": "",
      "date": "2026-10-19",
      "paymentMethod": "cash",
      "notes": "Monthly food shopping",
      "createdAt": "2026-10-19T08:30:00.000Z",
      "updatedAt": "2026-10-19T08:30:00.000Z"
    }
  ],
  "totalItems": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

---

## Budgets

### 1) Get budgets

#### `GET /api/budgets`
Returns all budgets for the authenticated user.

Optional query param:

```text
month=YYYY-MM
```

If `month` is provided, it returns a single matching budget object.

Success response:

```json
{
  "budgets": [
    {
      "id": "b2d6d7d5-ec0b-4dbe-9507-4a8db0f04d2a",
      "user_id": "5a2c4f4e-7f8e-48fc-881d-4d943a4af861",
      "month": "2026-10",
      "amount": 200000,
      "created_at": "2026-10-01T10:00:00.000Z",
      "updated_at": "2026-10-01T10:00:00.000Z"
    }
  ]
}
```

### 2) Create or update a monthly budget

#### `POST /api/budgets`
Creates a budget for a month, or updates it if the same month already exists.

Request body:

```json
{
  "month": "2026-10",
  "amount": 200000
}
```

Success response:

```json
{
  "budget": {
    "id": "b2d6d7d5-ec0b-4dbe-9507-4a8db0f04d2a",
    "user_id": "5a2c4f4e-7f8e-48fc-881d-4d943a4af861",
    "month": "2026-10",
    "amount": 200000,
    "created_at": "2026-10-01T10:00:00.000Z",
    "updated_at": "2026-10-01T10:00:00.000Z"
  }
}
```

### 3) Update a specific budget

#### `PUT /api/budgets/:id`
Updates a budget entry for the authenticated user.

Request body:

```json
{
  "month": "2026-11",
  "amount": 250000
}
```

### 4) Delete a budget

#### `DELETE /api/budgets/:id`
Deletes one budget for the authenticated user.

Success response:

```json
{
  "success": true,
  "deletedId": "b2d6d7d5-ec0b-4dbe-9507-4a8db0f04d2a"
}
```

---

## Admin API

Admin routes require the user role `ADMIN`.

### `GET /api/admin/insights`
Returns general system analytics.

### `GET /api/admin/users`
Returns all registered users.

### `GET /api/admin/expenses`
Returns all platform expenses.

### `PUT /api/admin/expenses/:id`
Updates any expense in the system.

### `DELETE /api/admin/expenses/:id`
Deletes any expense in the system.

### `GET /api/admin/categories`
Returns categories for admin management.

### `POST /api/admin/categories`
Creates a category as admin.

### `PUT /api/admin/categories/:id`
Updates a category as admin.

### `DELETE /api/admin/categories/:id`
Deletes a category as admin.

---

## Common Error Responses

The API uses standard JSON error payloads.

### Validation error

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Category is invalid"
}
```

### Unauthorized

```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

### Not found

```json
{
  "error": "EXPENSE_NOT_FOUND",
  "message": "Expense not found"
}
```

### Duplicate email

```json
{
  "error": "EMAIL_TAKEN",
  "message": "An account with this email already exists"
}
```

---

## Health Check

### `GET /api/health`
Returns the server health status.

Example response:

```json
{
  "status": "ok"
}
```

---

## Notes

- Protected routes require a valid JWT.
- Admin-only endpoints are guarded by role-based middleware.
- The app expects PostgreSQL to be running and the schema to be initialized before the backend works properly.
- Frontend requests are made through `VITE_API_URL`, usually set to `http://localhost:5000/api` during local development.
