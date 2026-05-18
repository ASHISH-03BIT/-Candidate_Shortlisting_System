const User = require("../models/User");
const bcrypt = require("../utils/password");
const { signToken } = require("../utils/token");

const createToken = (user) => signToken({ id: user._id, email: user.email, name: user.name });
const userResponse = (user) => ({ id: user._id, name: user.name, email: user.email });

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(422).json({ message: "Name, email, and password are required." });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: "A record with this email already exists." });
    }

    const user = await User.create({ name, email, password: await bcrypt.hash(password) });

    return res.status(201).json({
      message: "User created successfully",
      token: createToken(user),
      user: userResponse(user)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "A record with this email already exists." });
    }

    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.json({ token: createToken(user), user: userResponse(user) });
  } catch (error) {
    return next(error);
  }
};
