const express = require("express");
const { requireAuth } = require("../middleware");
const { listCategories } = require("../controllers/categoryController");

const router = express.Router();

router.get("/", requireAuth, listCategories);

module.exports = router;