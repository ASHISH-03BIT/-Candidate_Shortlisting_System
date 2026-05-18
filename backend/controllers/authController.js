const User = require("../models/User");
const { comparePassword, hashPassword } = require("../utils/password");
const { signToken } = require("../utils/token");

const createToken = (user) => signToken({ id: user._id, email: user.email, name: user.name });
const userResponse = (user) => ({ id: user._id, name: user.name, email: user.email });

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "A user with this email already exists." });
    }

    const user = await User.create({ name, email, password: await hashPassword(password) });

    return res.status(201).json({ token: createToken(user), user: userResponse(user) });
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.json({ token: createToken(user), user: userResponse(user) });
  } catch (error) {
    return next(error);
  }
};
