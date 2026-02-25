import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

/* -------------------------------------------
   TOKEN GENERATOR (6 MONTHS)
-------------------------------------------- */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "180d" } // 6 months
  );
};

/* -------------------------------------------
   REGISTER USER
-------------------------------------------- */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      lastLogin: new Date(), // ✅ optional: first login time
    });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------
   LOGIN USER (FIXED ✅)
-------------------------------------------- */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {

      // ✅ UPDATE LAST LOGIN
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
