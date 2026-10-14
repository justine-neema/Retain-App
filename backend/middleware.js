const { verifyToken } = require("./auth");

// reject the unouthorized users
function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Missing or malformed Authorization header",
    });
  }

  const token = header.slice("Bearer ".length);

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
  }
}

/**
 * Rejects the request with 403 if the authenticated user isn't an admin.
 * MUST be used after requireAuth (assumes req.user already exists).
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };