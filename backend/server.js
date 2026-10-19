const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const cors = require("cors");

const db = require("./db");
const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/categories");
const expenseRoutes = require("./routes/expenses");
const budgetRoutes = require("./routes/budgets");
const adminRoutes = require("./routes/admin");

const app = express();

// CORS configuration
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use(express.json());

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/admin", adminRoutes);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ error: "NOT_FOUND", message: "Route not found" });
});

// Global Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    error: "SERVER_ERROR",
    message: err.message || "Something went wrong",
  });
});

// start server
const PORT = process.env.PORT || 5000;

// initialize db tables
db.initializeDatabase().catch(console.error);

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});