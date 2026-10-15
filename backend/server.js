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

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/admin", adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "NOT_FOUND", message: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled server error:", err);

  const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;
  const message = err.message || "Something went wrong";

  res.status(statusCode).json({
    error: err.error || "SERVER_ERROR",
    message,
  });
});

const PORT = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await db.initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    console.warn(
      "The API server was not able to initialize its database schema. Please grant CREATE privileges to the configured PostgreSQL user."
    );
  }
}

startServer();
