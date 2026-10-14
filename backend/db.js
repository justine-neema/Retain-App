const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_DATABASE,
});

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

pool
  .connect()
  .then((client) => {
    console.log("Successfully connected to the retain database!");
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
