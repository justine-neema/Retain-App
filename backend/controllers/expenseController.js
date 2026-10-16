// backend/controllers/expenseController.js

const { z } = require("zod");
const db = require("../db");

const expenseSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  amount: z.coerce.number().nonnegative("Amount must be zero or greater"),
  categoryId: z.string().uuid("Category is invalid"),
  date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Date is invalid",
  }),
  paymentMethod: z.string().trim().min(1, "Payment method is required").max(100),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

function normalizeExpense(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    amount: Number(row.amount),
    categoryId: row.category_id,
    categoryName: row.category_name,
    categoryColor: row.category_color,
    categoryIcon: row.category_icon,
    date: row.date,
    paymentMethod: row.payment_method,
    notes: row.notes || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// SELECT clause reused everywhere an expense is fetched with its category joined.
const EXPENSE_SELECT = `
  SELECT e.id, e.user_id, e.title, e.amount, e.category_id, e.date, e.payment_method,
         e.notes, e.created_at, e.updated_at,
         c.name AS category_name, c.color AS category_color, c.icon AS category_icon
  FROM expenses e
  JOIN categories c ON c.id = e.category_id
`;

/* -------------------- GET /api/expenses/summary -------------------- */
async function getExpenseSummary(req, res, next) {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);

    const totalResult = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS total_spent
       FROM expenses
       WHERE user_id = $1 AND to_char(date, 'YYYY-MM') = $2`,
      [req.user.sub, month]
    );

    const budgetResult = await db.query(
      `SELECT amount FROM budgets WHERE user_id = $1 AND month = $2`,
      [req.user.sub, month]
    );

    const highestResult = await db.query(
      `SELECT e.id, e.title, e.amount, e.date
       FROM expenses e
       WHERE e.user_id = $1
       ORDER BY e.amount DESC, e.date DESC
       LIMIT 1`,
      [req.user.sub]
    );

    const byCategory = await db.query(
      `SELECT c.name AS category_name, c.color AS category_color, c.icon AS category_icon,
              COALESCE(SUM(e.amount), 0) AS total
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id AND e.user_id = $1
       WHERE to_char(e.date, 'YYYY-MM') = $2 OR e.id IS NULL
       GROUP BY c.id, c.name, c.color, c.icon
       ORDER BY total DESC, c.name ASC`,
      [req.user.sub, month]
    );

    const recent = await db.query(
  `${EXPENSE_SELECT}
   WHERE e.user_id = $1 AND to_char(e.date, 'YYYY-MM') = $2
   ORDER BY e.date DESC, e.created_at DESC
   LIMIT 10`,
  [req.user.sub, month]
);

    const totalSpent = Number(totalResult.rows[0]?.total_spent || 0);
    const monthlyBudget = Number(budgetResult.rows[0]?.amount || 0);

    return res.json({
      month,
      totalSpent,
      monthlyBudget,
      remainingBudget: monthlyBudget - totalSpent,
      highestExpense: highestResult.rows[0]
        ? {
            id: highestResult.rows[0].id,
            title: highestResult.rows[0].title,
            amount: Number(highestResult.rows[0].amount),
            date: highestResult.rows[0].date,
          }
        : null,
      byCategory: byCategory.rows.map((row) => ({
        category: row.category_name,
        total: Number(row.total),
        color: row.category_color,
        icon: row.category_icon,
      })),
      recentExpenses: recent.rows.map(normalizeExpense),
    });
  } catch (err) {
    return next(err);
  }
}

/* -------------------- GET /api/expenses/dashboard -------------------- */
async function getDashboard(req, res, next) {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);

    const summary = await db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN to_char(date, 'YYYY-MM') = $2 THEN amount ELSE 0 END), 0) AS total_spent_this_month,
         COALESCE(SUM(amount), 0) AS total_spent_all_time,
         MAX(amount) AS highest_expense
       FROM expenses
       WHERE user_id = $1`,
      [req.user.sub, month]
    );

    const budget = await db.query(
      "SELECT amount FROM budgets WHERE user_id = $1 AND month = $2",
      [req.user.sub, month]
    );

    const recent = await db.query(
      `${EXPENSE_SELECT}
       WHERE e.user_id = $1
       ORDER BY e.date DESC, e.created_at DESC
       LIMIT 5`,
      [req.user.sub]
    );

    const categories = await db.query(
      `SELECT c.name AS category_name,
              COALESCE(SUM(e.amount), 0) AS total,
              c.color AS category_color,
              c.icon AS category_icon
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id AND e.user_id = $1
       GROUP BY c.id, c.name, c.color, c.icon
       ORDER BY total DESC, c.name ASC`,
      [req.user.sub]
    );

    const row = summary.rows[0] || {};

    return res.json({
      month,
      totalSpentThisMonth: Number(row.total_spent_this_month || 0),
      totalSpentAllTime: Number(row.total_spent_all_time || 0),
      highestExpense: Number(row.highest_expense || 0),
      monthlyBudget: Number((budget.rows[0] && budget.rows[0].amount) || 0),
      recentExpenses: recent.rows.map(normalizeExpense),
      spendingByCategory: categories.rows.map((item) => ({
        category: item.category_name,
        total: Number(item.total || 0),
        color: item.category_color,
        icon: item.category_icon,
      })),
    });
  } catch (err) {
    return next(err);
  }
}

/* -------------------- GET /api/expenses/search -------------------- */
async function searchExpenses(req, res, next) {
  try {
    const {
      q,
      categoryId,
      paymentMethod,
      startDate,
      endDate,
      sortBy = "date",
      order = "desc",
    } = req.query;

    const whereClauses = ["e.user_id = $1"];
    const params = [req.user.sub];
    let index = 2;

    if (q) {
      whereClauses.push(
        `(LOWER(e.title) LIKE $${index} OR LOWER(COALESCE(e.notes, '')) LIKE $${index})`
      );
      params.push(`%${String(q).toLowerCase()}%`);
      index += 1;
    }

    if (categoryId) {
      whereClauses.push(`e.category_id = $${index}`);
      params.push(categoryId);
      index += 1;
    }

    if (paymentMethod) {
      whereClauses.push(`LOWER(e.payment_method) = LOWER($${index})`);
      params.push(String(paymentMethod));
      index += 1;
    }

    if (startDate) {
      whereClauses.push(`e.date >= $${index}`);
      params.push(startDate);
      index += 1;
    }

    if (endDate) {
      whereClauses.push(`e.date <= $${index}`);
      params.push(endDate);
      index += 1;
    }

    const sortColumns = {
      date: "e.date",
      amount: "e.amount",
      title: "e.title",
      createdAt: "e.created_at",
    };

    const sortColumn = sortColumns[sortBy] || "e.date";
    const sortDirection =
      String(order).toLowerCase() === "asc" ? "ASC" : "DESC";

    const result = await db.query(
      `${EXPENSE_SELECT}
       WHERE ${whereClauses.join(" AND ")}
       ORDER BY ${sortColumn} ${sortDirection}, e.created_at DESC`,
      params
    );

    return res.json({ expenses: result.rows.map(normalizeExpense) });
  } catch (err) {
    return next(err);
  }
}

/* -------------------- GET /api/expenses -------------------- */
async function listExpenses(req, res, next) {
  try {
    const result = await db.query(
      `${EXPENSE_SELECT}
       WHERE e.user_id = $1
       ORDER BY e.date DESC, e.created_at DESC`,
      [req.user.sub]
    );

    return res.json({ expenses: result.rows.map(normalizeExpense) });
  } catch (err) {
    return next(err);
  }
}

/* -------------------- GET /api/expenses/:id -------------------- */
async function getExpenseById(req, res, next) {
  try {
    const result = await db.query(
      `${EXPENSE_SELECT}
       WHERE e.id = $1 AND e.user_id = $2`,
      [req.params.id, req.user.sub]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "EXPENSE_NOT_FOUND",
        message: "Expense not found",
      });
    }

    return res.json({ expense: normalizeExpense(result.rows[0]) });
  } catch (err) {
    return next(err);
  }
}

/* -------------------- POST /api/expenses -------------------- */
async function createExpense(req, res, next) {
  try {
    const parsed = expenseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message || "Invalid expense payload",
      });
    }

    const { title, amount, categoryId, date, paymentMethod, notes } = parsed.data;

    const categoryCheck = await db.query(
      "SELECT id FROM categories WHERE id = $1",
      [categoryId]
    );
    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({
        error: "CATEGORY_NOT_FOUND",
        message: "Category not found",
      });
    }

    const inserted = await db.query(
      `INSERT INTO expenses (user_id, title, amount, category_id, date, payment_method, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [req.user.sub, title, amount, categoryId, date, paymentMethod, notes || ""]
    );

    // Fetch the joined row so the response includes category metadata.
    const full = await db.query(
      `${EXPENSE_SELECT} WHERE e.id = $1`,
      [inserted.rows[0].id]
    );

    return res
      .status(201)
      .json({ expense: normalizeExpense(full.rows[0]) });
  } catch (err) {
    return next(err);
  }
}

/* -------------------- PUT /api/expenses/:id -------------------- */
async function updateExpense(req, res, next) {
  try {
    const parsed = expenseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message || "Invalid expense payload",
      });
    }

    const existing = await db.query(
      "SELECT id FROM expenses WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.sub]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: "EXPENSE_NOT_FOUND",
        message: "Expense not found",
      });
    }

    const { title, amount, categoryId, date, paymentMethod, notes } = parsed.data;

    const categoryCheck = await db.query(
      "SELECT id FROM categories WHERE id = $1",
      [categoryId]
    );
    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({
        error: "CATEGORY_NOT_FOUND",
        message: "Category not found",
      });
    }

    await db.query(
      `UPDATE expenses
       SET title = $1,
           amount = $2,
           category_id = $3,
           date = $4,
           payment_method = $5,
           notes = $6,
           updated_at = NOW()
       WHERE id = $7 AND user_id = $8`,
      [
        title,
        amount,
        categoryId,
        date,
        paymentMethod,
        notes || "",
        req.params.id,
        req.user.sub,
      ]
    );

    const full = await db.query(
      `${EXPENSE_SELECT} WHERE e.id = $1`,
      [req.params.id]
    );

    return res.json({ expense: normalizeExpense(full.rows[0]) });
  } catch (err) {
    return next(err);
  }
}

/* -------------------- DELETE /api/expenses/:id -------------------- */
async function deleteExpense(req, res, next) {
  try {
    const result = await db.query(
      "DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user.sub]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "EXPENSE_NOT_FOUND",
        message: "Expense not found",
      });
    }

    return res.json({ success: true, deletedId: result.rows[0].id });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getExpenseSummary,
  getDashboard,
  searchExpenses,
  listExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  normalizeExpense,
};