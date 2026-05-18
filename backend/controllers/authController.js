const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { signToken } = require("../utils/token");

const userResponse = (user) => ({ id: user._id, name: user.name, email: user.email });

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(422).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });
    console.log("Existing User:", existingUser);

    if (existingUser) {
      return res.status(400).json({ message: "A record with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Unauthorized" });

    const token = signToken({ id: user._id }, 60 * 60);
    return res.status(200).json({ message: "Login successful", token, user: userResponse(user) });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
