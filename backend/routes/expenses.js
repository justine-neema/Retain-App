const express = require("express");
const { requireAuth } = require("../middleware");
const {
  getExpenseSummary,
  getDashboard,
  searchExpenses,
  listExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

const router = express.Router();

router.get("/summary", requireAuth, getExpenseSummary);
router.get("/dashboard", requireAuth, getDashboard);
router.get("/search", requireAuth, searchExpenses);
router.get("/", requireAuth, listExpenses);
router.get("/:id", requireAuth, getExpenseById);
router.post("/", requireAuth, createExpense);
router.put("/:id", requireAuth, updateExpense);
router.delete("/:id", requireAuth, deleteExpense);

module.exports = router;