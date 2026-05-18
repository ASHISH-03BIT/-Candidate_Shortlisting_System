const crypto = require("crypto");

const ITERATIONS = 120000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

const hash = async (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return `${ITERATIONS}:${salt}:${passwordHash}`;
};

const compare = async (password, storedPassword) => {
  const [iterations, salt, passwordHash] = String(storedPassword || "").split(":");
  if (!iterations || !salt || !passwordHash) return false;

  const candidateHash = crypto
    .pbkdf2Sync(password, salt, Number(iterations), KEY_LENGTH, DIGEST)
    .toString("hex");

  const storedBuffer = Buffer.from(passwordHash, "hex");
  const candidateBuffer = Buffer.from(candidateHash, "hex");

  if (storedBuffer.length !== candidateBuffer.length) return false;

  return crypto.timingSafeEqual(storedBuffer, candidateBuffer);
};

module.exports = {
  compare,
  hash,
  comparePassword: compare,
  hashPassword: hash
};
