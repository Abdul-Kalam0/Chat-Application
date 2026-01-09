import bcrypt from "bcrypt";
import UserModel from "../models/User.js";

export const register = async (req, res) => {
  const { username, password } = req.body;
  try {
    // 3️⃣ Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and Password are required",
      });
    }

    // 2️⃣ Normalize input
    username = username.trim().toLowerCase();

    // 3️⃣ Strong password rule
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }
    // 4️⃣ Check existing user
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username already taken",
      });
    }
    // 5️⃣ Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 6️⃣ Create user
    const user = new UserModel({
      username,
      password: passwordHash,
    });
    await user.save();

    // 7️⃣ Respond
    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        id: user._id,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

export const login = () => {};
