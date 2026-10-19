const db = require("../db");
const { hashPassword, verifyPassword, signToken } = require("../auth");

function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
  };
}

// creating a user and return token
async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "name, email, and password are required",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Password must be at least 6 characters",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Invalid email format",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: "EMAIL_TAKEN",
        message: "An account with this email already exists",
      });
    }

    const passwordHash = await hashPassword(password);

    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'USER')
       RETURNING id, name, email, role`,
      [name.trim(), normalizedEmail, passwordHash]
    );

    const user = result.rows[0];
    const token = signToken(user);

    return res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    return next(err);
  }
}

// Verify if credentials are correct and return user $ token
async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await db.query(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = $1",
      [normalizedEmail]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    const token = signToken(user);
    return res.json({ token, user: publicUser(user) });
  } catch (err) {
    return next(err);
  }
}

// require authentication middleware and return the current user
async function me(req, res, next) {
  try {
    const result = await db.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [req.user.sub]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "USER_NOT_FOUND",
        message: "User no longer exists",
      });
    }

    return res.json({ user: publicUser(result.rows[0]) });
  } catch (err) {
    return next(err);
  }
}

module.exports = { signup, login, me };