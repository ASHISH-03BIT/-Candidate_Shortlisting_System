const jwt = require("jsonwebtoken");

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
};

const signToken = (payload, expiresIn = "7d") => jwt.sign(payload, getJwtSecret(), { expiresIn });

const verifyToken = (token) => jwt.verify(token, getJwtSecret());

module.exports = { signToken, verifyToken };
