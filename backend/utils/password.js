const crypto = require("crypto");

const ITERATIONS = 120000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return `${ITERATIONS}:${salt}:${hash}`;
};

const comparePassword = async (password, storedPassword) => {
  const [iterations, salt, hash] = String(storedPassword || "").split(":");
  if (!iterations || !salt || !hash) return false;

  const candidateHash = crypto
    .pbkdf2Sync(password, salt, Number(iterations), KEY_LENGTH, DIGEST)
    .toString("hex");

  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidateHash, "hex"));
};

module.exports = { comparePassword, hashPassword };
