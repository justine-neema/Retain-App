const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware");
const {
  getInsights,
  listCategoriesForAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/adminController");

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/insights", getInsights);
router.get("/categories", listCategoriesForAdmin);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

module.exports = router;