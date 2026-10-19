# Retain API Documentation

Base URL:

```text
http://localhost:5000/api
```

All protected endpoints require a bearer token:

```http
Authorization: Bearer <token>
```

## Authentication

### `POST /api/auth/signup`
Creates a new user account.

Request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "USER"
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "USER"
  }
}
```

### `POST /api/auth/login`
Authenticates an existing user and returns a JWT token.

### `GET /api/auth/me`
Returns the currently authenticated user.

---

## Expenses

### `GET /api/expenses`
Returns all expenses for the logged-in user.

### `GET /api/expenses/:id`
Returns a single expense by ID.

### `POST /api/expenses`
Creates a new expense.

Example request body:

```json
{
  "title": "Groceries",
  "amount": 3500,
  "categoryId": 1,
  "paymentMethod": "cash",
  "date": "2026-10-19",
  "notes": "Monthly food shopping"
}
```

### `PUT /api/expenses/:id`
Updates an existing expense.

### `DELETE /api/expenses/:id`
Deletes an expense.

### `GET /api/expenses/summary`
Returns total and summary data for the logged-in user's expenses.

### `GET /api/expenses/dashboard`
Returns dashboard metrics for the user.

### `GET /api/expenses/search`
Returns filtered and sorted expenses with pagination.

Possible query params:

```text
q
categoryId
paymentMethod
startDate
endDate
sortBy
order
page
limit
```

---

## Categories

### `GET /api/categories`
Returns categories for the current user.

### `POST /api/categories`
Creates a new category.

### `PUT /api/categories/:id`
Updates a category.

### `DELETE /api/categories/:id`
Deletes a category.

---

## Budgets

### `GET /api/budgets`
Returns budget information for the current user.

### `POST /api/budgets`
Creates or updates the current month's budget.

### `PUT /api/budgets/:id`
Updates a specific budget entry.

### `DELETE /api/budgets/:id`
Deletes a specific budget entry.

---

## Admin Endpoints

All admin routes require the `ADMIN` role.

### `GET /api/admin/insights`
Returns platform analytics, including totals and category usage data.

### `GET /api/admin/users`
Returns all registered users.

### `GET /api/admin/expenses`
Returns all platform expenses.

### `PUT /api/admin/expenses/:id`
Updates any expense as admin.

### `DELETE /api/admin/expenses/:id`
Deletes any expense as admin.

### `GET /api/admin/categories`
Returns all categories for admin management.

### `POST /api/admin/categories`
Creates a category as admin.

### `PUT /api/admin/categories/:id`
Updates a category as admin.

### `DELETE /api/admin/categories/:id`
Deletes a category as admin.

---

## Common Response Format

Successful responses usually return JSON objects.

Example success:

```json
{
  "success": true
}
```

Example error:

```json
{
  "error": "SERVER_ERROR",
  "message": "Something went wrong"
}
```

## Notes

- Protected endpoints require JWT authentication.
- Admin routes are guarded by role-based middleware.
- Database setup is required before the backend will operate correctly.
- The frontend uses `VITE_API_URL` to connect to the backend API.
