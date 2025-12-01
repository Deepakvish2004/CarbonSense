import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";

const router = express.Router();

// REGISTER ADMIN
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    // JWT Token
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token,
    });
  } catch (err) {
    console.error("Admin registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
