const User = require("../models/User");
const { hashPassword, signToken, verifyPassword } = require("../utils/auth");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt
});

const issueAuthResponse = (res, user, status = 200) => {
  const safeUser = sanitizeUser(user);
  const token = signToken({ id: String(user._id), email: user.email, name: user.name });
  return res.status(status).json({ token, user: safeUser });
};

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existingUser = await User.findOne({ email: String(email).toLowerCase() });
    if (existingUser) return res.status(409).json({ message: "A user with this email already exists." });

    const user = await User.create({ name, email, passwordHash: hashPassword(password) });
    return issueAuthResponse(res, user, 201);
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email: String(email).toLowerCase() }).select("+passwordHash");
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return issueAuthResponse(res, user);
  } catch (error) {
    return next(error);
  }
};
