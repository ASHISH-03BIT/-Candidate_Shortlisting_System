const crypto = require("crypto");

const base64Url = (input) => Buffer.from(input).toString("base64url");

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
};

const signToken = (payload, expiresInSeconds = 7 * 24 * 60 * 60) => {
  const header = { alg: "HS256", typ: "JWT" };
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSeconds };
  const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(body))}`;
  const signature = crypto.createHmac("sha256", getJwtSecret()).update(unsignedToken).digest("base64url");
  return `${unsignedToken}.${signature}`;
};

const verifyToken = (token) => {
  const [header, payload, signature] = String(token || "").split(".");
  if (!header || !payload || !signature) throw new Error("Malformed token");

  const unsignedToken = `${header}.${payload}`;
  const expectedSignature = crypto.createHmac("sha256", getJwtSecret()).update(unsignedToken).digest("base64url");
  if (signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new Error("Invalid token signature");
  }

  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Expired token");
  }

  return decoded;
};

module.exports = { signToken, verifyToken };
