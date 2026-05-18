const { verifyToken } = require("../utils/token");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required." });
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = protect;
