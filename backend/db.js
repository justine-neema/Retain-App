const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

// use cloud database providers
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      // including ssl for cloud database
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    }
  : {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_DATABASE,
    };

const pool = new Pool(poolConfig);

async function initializeDatabase() {
  const tableCheck = await pool.query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name IN ('users', 'categories', 'expenses', 'budgets')`
  );

  if (tableCheck.rows.length >= 4) {
    console.log("Database schema already initialized.");
    return;
  }

  const schemaPath = path.join(__dirname, "schema.sql");
  if (!fs.existsSync(schemaPath)) {
    console.log("schema.sql not found, skipping auto-initialization.");
    return;
  }

  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  try {
    await pool.query(schemaSql);
    console.log("Database schema verified successfully.");
  } catch (error) {
    console.warn(
      "Database schema could not be initialized automatically. Ensure the configured Postgres user has CREATE TABLE privileges."
    );
    console.warn(error.message);
  }
}

// Test connection on startup
pool
  .connect()
  .then((client) => {
    console.log("Successfully connected to the database!");
    client.release();
  })
  .catch((err) => {
    console.error("Error acquiring client", err.stack || err);
  });

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initializeDatabase,
};