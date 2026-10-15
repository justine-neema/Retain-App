// backend/controllers/categoryController.js

const db = require("../db");

/**
 * GET /api/categories
 * Public to any authenticated user.
 * Returns every category, ordered alphabetically.
 */
async function listCategories(req, res, next) {
  try {
    const result = await db.query(
      `SELECT id, name, icon, color, is_default AS "isDefault"
       FROM categories
       ORDER BY name ASC`
    );

    return res.json({ categories: result.rows });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listCategories };