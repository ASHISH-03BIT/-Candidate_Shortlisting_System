const crypto = require("crypto");

const base64Url = (input) => Buffer.from(input).toString("base64url");
const getJwtSecret = () => process.env.JWT_SECRET || "dev-only-change-this-secret";

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedPassword) => {
  const [salt, originalHash] = String(storedPassword || "").split(":");
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 64, "sha512").toString("hex");
  const expected = Buffer.from(originalHash, "hex");
  const actual = Buffer.from(hash, "hex");
  return expected.length === actual.length && crypto.timingSafeEqual(actual, expected);
};

const signToken = (payload, expiresInSeconds = 60 * 60 * 24) => {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSeconds };
  const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(body))}`;
  const signature = crypto.createHmac("sha256", getJwtSecret()).update(unsignedToken).digest("base64url");
  return `${unsignedToken}.${signature}`;
};

const verifyToken = (token) => {
  const [encodedHeader, encodedPayload, signature] = String(token || "").split(".");
  if (!encodedHeader || !encodedPayload || !signature) throw new Error("Invalid token.");

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto.createHmac("sha256", getJwtSecret()).update(unsignedToken).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new Error("Invalid token signature.");
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) throw new Error("Token expired.");
  return payload;
};

module.exports = { hashPassword, verifyPassword, signToken, verifyToken };
