const express = require("express");
const { requireAuth } = require("../middleware");
const {
  getBudgets,
  createOrUpdateBudget,
  updateBudget,
  deleteBudget,
} = require("../controllers/budgetController");

const router = express.Router();

router.get("/", requireAuth, getBudgets);
router.post("/", requireAuth, createOrUpdateBudget);
router.put("/:id", requireAuth, updateBudget);
router.delete("/:id", requireAuth, deleteBudget);

module.exports = router;