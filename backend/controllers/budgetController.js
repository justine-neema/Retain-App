// backend/controllers/budgetController.js

const { z } = require("zod");
const db = require("../db");

const budgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
  amount: z.coerce.number().nonnegative("Budget must be zero or greater"),
});

/**
 * GET /api/budgets
 * GET /api/budgets?month=YYYY-MM
 *
 * With no query param → returns all budgets for the user.
 * With ?month=YYYY-MM → returns a single budget or null.
 */
async function getBudgets(req, res, next) {
  try {
    const { month } = req.query;

    if (month) {
      const result = await db.query(
        `SELECT id, user_id, month, amount, created_at, updated_at
         FROM budgets
         WHERE user_id = $1 AND month = $2`,
        [req.user.sub, month]
      );
      return res.json({ budget: result.rows[0] || null });
    }

    const result = await db.query(
      `SELECT id, user_id, month, amount, created_at, updated_at
       FROM budgets
       WHERE user_id = $1
       ORDER BY month DESC`,
      [req.user.sub]
    );

    return res.json({ budgets: result.rows });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/budgets
 * Upsert: creates the budget for that month, or updates it if it exists.
 * Enforced by UNIQUE(user_id, month) on the table.
 */
async function createOrUpdateBudget(req, res, next) {
  try {
    const parsed = budgetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message || "Invalid budget payload",
      });
    }

    const { month, amount } = parsed.data;

    const existing = await db.query(
      "SELECT id FROM budgets WHERE user_id = $1 AND month = $2",
      [req.user.sub, month]
    );

    if (existing.rows.length > 0) {
      const updated = await db.query(
        `UPDATE budgets
         SET amount = $1, updated_at = NOW()
         WHERE user_id = $2 AND month = $3
         RETURNING *`,
        [amount, req.user.sub, month]
      );
      return res.json({ budget: updated.rows[0] });
    }

    const created = await db.query(
      `INSERT INTO budgets (user_id, month, amount)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.sub, month, amount]
    );

    return res.status(201).json({ budget: created.rows[0] });
  } catch (err) {
    return next(err);
  }
}

/**
 * PUT /api/budgets/:id
 * Updates by ID. Ownership enforced via user_id in WHERE.
 */
async function updateBudget(req, res, next) {
  try {
    const parsed = budgetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message || "Invalid budget payload",
      });
    }

    const { month, amount } = parsed.data;

    const result = await db.query(
      `UPDATE budgets
       SET month = $1, amount = $2, updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [month, amount, req.params.id, req.user.sub]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "BUDGET_NOT_FOUND",
        message: "Budget not found",
      });
    }

    return res.json({ budget: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

/**
 * DELETE /api/budgets/:id
 * Ownership enforced via user_id in WHERE.
 */
async function deleteBudget(req, res, next) {
  try {
    const result = await db.query(
      "DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user.sub]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "BUDGET_NOT_FOUND",
        message: "Budget not found",
      });
    }

    return res.json({ success: true, deletedId: result.rows[0].id });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getBudgets,
  createOrUpdateBudget,
  updateBudget,
  deleteBudget,
};