const { verifyToken } = require("../utils/auth");

const requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return res.status(401).json({ message: "Access denied. Login token is required." });

    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Access denied. Invalid or expired token." });
  }
};

module.exports = requireAuth;
