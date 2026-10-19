const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware");
const {
  getInsights,
  listAllUsers,
  listAllExpenses,
  updateAnyExpense,
  deleteAnyExpense,
  listCategoriesForAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/adminController");

const router = express.Router();

// Every route here requires a logged-in admin
router.use(requireAuth, requireAdmin);

router.get("/insights",          getInsights);
router.get("/users",             listAllUsers);

// Admin can view, edit, and delete ANY expense
router.get("/expenses",          listAllExpenses);
router.put("/expenses/:id",      updateAnyExpense);
router.delete("/expenses/:id",   deleteAnyExpense);

// Admin category management
router.get("/categories",        listCategoriesForAdmin);
router.post("/categories",       createCategory);
router.put("/categories/:id",    updateCategory);
router.delete("/categories/:id", deleteCategory);

module.exports = router;