import express from "express";
import User from "../models/userModel.js";
import Footprint from "../models/footprintModel.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* -------------------------------------------
   GET ALL USERS
-------------------------------------------- */
router.get("/users", protectAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* -------------------------------------------
   GET ALL CO₂ FOOTPRINTS
-------------------------------------------- */
router.get("/footprints", protectAdmin, async (req, res) => {
  try {
    const footprints = await Footprint.find().populate("user", "name email");
    return res.status(200).json(footprints);
  } catch (err) {
    console.error("Error fetching footprints:", err);
    return res.status(500).json({ message: "Failed to fetch footprints" });
  }
});

/* -------------------------------------------
   DELETE USER
-------------------------------------------- */
router.delete("/users/:id", protectAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------
   DELETE FOOTPRINT RECORD
-------------------------------------------- */
router.delete("/footprints/:id", protectAdmin, async (req, res) => {
  try {
    const record = await Footprint.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    await record.deleteOne();

    return res.status(200).json({ message: "Footprint deleted successfully" });
  } catch (err) {
    console.error("Error deleting record:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
