const db = require("../db");

// show all categories to every authenticated use, orderd alphabetically
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