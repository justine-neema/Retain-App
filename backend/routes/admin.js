// backend/routes/admin.js

const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware");
const {
  getInsights,
  listAllUsers,
  listAllExpenses,
  listCategoriesForAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/adminController");

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/insights",          getInsights);
router.get("/users",             listAllUsers);
router.get("/expenses",          listAllExpenses);
router.get("/categories",        listCategoriesForAdmin);
router.post("/categories",       createCategory);
router.put("/categories/:id",    updateCategory);
router.delete("/categories/:id", deleteCategory);

module.exports = router;