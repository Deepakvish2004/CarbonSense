import express from "express";
import User from "../models/userModel.js";
import Footprint from "../models/footprintModel.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Get all users
router.get("/users", protectAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ✅ Get all CO₂ footprints
router.get("/footprints", protectAdmin, async (req, res) => {
  try {
    const footprints = await Footprint.find().populate("user", "name email");
    res.json(footprints);
  } catch (err) {
    console.error("Error fetching footprints:", err);
    res.status(500).json({ message: "Failed to fetch footprints" });
  }
});

// ✅ Delete a user
router.delete("/users/:id", protectAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete a footprint record
router.delete("/footprints/:id", protectAdmin, async (req, res) => {
  try {
    const record = await Footprint.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    await record.deleteOne();
    res.json({ message: "Footprint deleted successfully" });
  } catch (err) {
    console.error("Error deleting record:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
