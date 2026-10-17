// backend/controllers/adminController.js

const db = require("../db");

/* -------------------- GET /api/admin/insights -------------------- */
async function getInsights(req, res, next) {
  try {
    const usersCount = await db.query(
      "SELECT COUNT(*)::int AS total FROM users"
    );
    const expensesCount = await db.query(
      "SELECT COUNT(*)::int AS total FROM expenses"
    );
    const totalValue = await db.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM expenses"
    );

    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthExpenses = await db.query(
      `SELECT COUNT(*)::int AS total
       FROM expenses
       WHERE to_char(date, 'YYYY-MM') = $1`,
      [currentMonth]
    );

    const categoryTotals = await db.query(
      `SELECT c.name, COALESCE(SUM(e.amount), 0) AS total
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id
       GROUP BY c.id, c.name
       ORDER BY total DESC, c.name ASC`
    );

    const topFive = await db.query(
      `SELECT c.name, COUNT(e.id)::int AS usage_count
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id
       GROUP BY c.id, c.name
       ORDER BY usage_count DESC, c.name ASC
       LIMIT 5`
    );

    const bottomFive = await db.query(
      `SELECT c.name, COUNT(e.id)::int AS usage_count
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id
       GROUP BY c.id, c.name
       ORDER BY usage_count ASC, c.name ASC
       LIMIT 5`
    );

    const recentExpenses = await db.query(
      `SELECT e.id, e.title, e.amount, e.date, u.email AS user_email
       FROM expenses e
       JOIN users u ON u.id = e.user_id
       ORDER BY e.created_at DESC
       LIMIT 10`
    );

    const recentUsers = await db.query(
      `SELECT id, name, email, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT 10`
    );

    return res.json({
      totalUsers: Number(usersCount.rows[0]?.total || 0),
      totalExpenses: Number(expensesCount.rows[0]?.total || 0),
      totalExpenseValue: Number(totalValue.rows[0]?.total || 0),
      expensesThisMonth: Number(currentMonthExpenses.rows[0]?.total || 0),
      totalSpendingPerCategory: categoryTotals.rows.map((row) => ({
        category: row.name,
        total: Number(row.total || 0),
      })),
      top5MostUsedCategories: topFive.rows.map((row) => ({
        category: row.name,
        usageCount: Number(row.usage_count || 0),
      })),
      bottom5LeastUsedCategories: bottomFive.rows.map((row) => ({
        category: row.name,
        usageCount: Number(row.usage_count || 0),
      })),
      recentlyAddedExpenses: recentExpenses.rows,
      recentlyRegisteredUsers: recentUsers.rows,
    });
  } catch (err) {
    return next(err);
  }
}

/* -------------------- GET /api/admin/users -------------------- */
async function listAllUsers(req, res, next) {
  try {
    const result = await db.query(
      `SELECT id, name, email, role, created_at
       FROM users
       ORDER BY created_at DESC`
    );
    return res.json({ users: result.rows });
  } catch (err) {
    return next(err);
  }
}

/* -------------------- GET /api/admin/expenses -------------------- */
async function listAllExpenses(req, res, next) {
  try {
    const result = await db.query(
      `SELECT
         e.id, e.title, e.amount, e.date, e.payment_method, e.notes,
         e.created_at,
         c.name AS category_name,
         u.email AS user_email,
         u.name  AS user_name
       FROM expenses e
       JOIN categories c ON c.id = e.category_id
       JOIN users u      ON u.id = e.user_id
       ORDER BY e.created_at DESC`
    );

    return res.json({
      expenses: result.rows.map((r) => ({
        id: r.id,
        title: r.title,
        amount: Number(r.amount),
        date: r.date,
        paymentMethod: r.payment_method,
        notes: r.notes || "",
        createdAt: r.created_at,
        categoryName: r.category_name,
        userEmail: r.user_email,
        userName: r.user_name,
      })),
    });
  } catch (err) {
    return next(err);
  }
}

/* -------------------- GET /api/admin/categories -------------------- */
async function listCategoriesForAdmin(req, res, next) {
  try {
    const result = await db.query(
      `SELECT id, name, icon, color, is_default AS "isDefault", created_at
       FROM categories
       ORDER BY name ASC`
    );

    return res.json({ categories: result.rows });
  } catch (err) {
    return next(err);
  }
}

/* -------------------- POST /api/admin/categories -------------------- */
async function createCategory(req, res, next) {
  try {
    const { name, icon = "tag", color = "#6B7280" } = req.body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Category name is required",
      });
    }

    const result = await db.query(
      `INSERT INTO categories (name, icon, color)
       VALUES ($1, $2, $3)
       RETURNING id, name, icon, color, is_default AS "isDefault"`,
      [name.trim(), icon, color]
    );

    return res.status(201).json({ category: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        error: "CATEGORY_EXISTS",
        message: "Category already exists",
      });
    }
    return next(err);
  }
}

/* -------------------- PUT /api/admin/categories/:id -------------------- */
async function updateCategory(req, res, next) {
  try {
    const { name, icon, color } = req.body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Category name is required",
      });
    }

    const result = await db.query(
      `UPDATE categories
       SET name = $1, icon = $2, color = $3
       WHERE id = $4
       RETURNING id, name, icon, color, is_default AS "isDefault"`,
      [name.trim(), icon || "tag", color || "#6B7280", req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "CATEGORY_NOT_FOUND",
        message: "Category not found",
      });
    }

    return res.json({ category: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        error: "CATEGORY_EXISTS",
        message: "Category already exists",
      });
    }
    return next(err);
  }
}

/* -------------------- DELETE /api/admin/categories/:id -------------------- */
async function deleteCategory(req, res, next) {
  try {
    const category = await db.query(
      "SELECT id, name, is_default FROM categories WHERE id = $1",
      [req.params.id]
    );

    if (category.rows.length === 0) {
      return res.status(404).json({
        error: "CATEGORY_NOT_FOUND",
        message: "Category not found",
      });
    }

    if (category.rows[0].is_default) {
      return res.status(400).json({
        error: "INVALID_DELETE",
        message: "The default category cannot be deleted",
      });
    }

    const defaultCategory = await db.query(
      "SELECT id FROM categories WHERE is_default = TRUE LIMIT 1"
    );
    const defaultId = defaultCategory.rows[0]?.id;

    if (defaultId) {
      await db.query(
        "UPDATE expenses SET category_id = $1 WHERE category_id = $2",
        [defaultId, req.params.id]
      );
    }

    await db.query("DELETE FROM categories WHERE id = $1", [req.params.id]);

    return res.json({
      success: true,
      deletedId: req.params.id,
      reassignedToDefault: !!defaultId,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getInsights,
  listAllUsers,
  listAllExpenses,
  listCategoriesForAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
};