import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";

const router = express.Router();

/* -------------------------------------------
   REGISTER ADMIN
-------------------------------------------- */
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Model auto-hashes using pre('save')
    const admin = await Admin.create({ name, email, password });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token,
    });
  } catch (err) {
    console.error("Admin registration error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------
   LOGIN ADMIN
-------------------------------------------- */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token,
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
