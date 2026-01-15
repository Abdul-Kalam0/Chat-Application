import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; // Added import
import UserModel from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET; // Added: Ensure this is set in .env

export const register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new UserModel({
      username: username.toLowerCase(), // Ensure lowercase for consistency
      password: hashedPassword,
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "4h" });
    res.status(201).json({
      message: "User registered successfully.",
      token,
      username: user.username,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await UserModel.findOne({ username: username.toLowerCase() }); // Ensure lowercase
    if (!user) return res.status(404).json({ message: "User not found." });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "4h" }); // Added: Generate token
    res
      .status(200)
      .json({ message: "Login successful", token, username: user.username }); // Added: Return token
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while login.", error: error });
  }
};
