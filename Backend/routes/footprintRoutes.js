import express from "express";
import asyncHandler from "express-async-handler";
import Footprint from "../models/footprintModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/footprint/calculate
 * @desc    Calculate CO₂ emission, efficiency score & store record
 * @access  Protected (User)
 */
router.post(
  "/calculate",
  protect,
  asyncHandler(async (req, res) => {
    const { deviceType, powerRating, usageHours } = req.body;

    // -----------------------------
    // 1. Validate Required Fields
    // -----------------------------
    if (!deviceType || !powerRating || !usageHours) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const pwr = Number(powerRating);
    const hrs = Number(usageHours);

    // -----------------------------
    // 2. Validate Positive Numbers
    // -----------------------------
    if (isNaN(pwr) || isNaN(hrs) || pwr <= 0 || hrs <= 0) {
      return res.status(400).json({
        message: "Power rating and usage hours must be valid positive numbers",
      });
    }

    // -----------------------------
    // 3. CO₂ Calculation (kg)
    // -----------------------------
    const kWh = (pwr * hrs) / 1000;
    const emissionFactor = 0.82; // kg CO₂ / kWh
    let co2Emission = kWh * emissionFactor;

    // Prevent negative or invalid values
    if (!isFinite(co2Emission) || co2Emission < 0) {
      co2Emission = 0;
    }

    co2Emission = parseFloat(co2Emission.toFixed(3));

    // -----------------------------
    // 4. Efficiency Rating (1–5)
    // -----------------------------
    const emissionRate = co2Emission / hrs;

    let efficiency = 5;
    if (emissionRate > 0.3 && emissionRate <= 0.6) efficiency = 4;
    else if (emissionRate > 0.6 && emissionRate <= 1.0) efficiency = 3;
    else if (emissionRate > 1.0 && emissionRate <= 2.0) efficiency = 2;
    else if (emissionRate > 2.0) efficiency = 1;

    // -----------------------------
    // 5. Save Record
    // -----------------------------
    const newFootprint = await Footprint.create({
      user: req.user._id,
      deviceType,
      powerRating: pwr,
      usageHours: hrs,
      co2Emission,
      efficiency,
      date: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Calculation saved successfully!",
      footprint: newFootprint,
    });
  })
);

/**
 * @route   GET /api/footprint/history
 * @desc    Get logged-in user’s CO₂ history (latest first)
 * @access  Protected (User)
 */
router.get(
  "/history",
  protect,
  asyncHandler(async (req, res) => {
    const records = await Footprint.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("-__v");

    res.json(records);
  })
);

/**
 * @route   DELETE /api/footprint/:id
 * @desc    Delete footprint record
 * @access  Protected (User)
 */
router.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const footprint = await Footprint.findById(req.params.id);

    if (!footprint) {
      return res.status(404).json({ message: "Record not found" });
    }

    if (footprint.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not authorized to delete this record",
      });
    }

    await footprint.deleteOne();

    res.json({ success: true, message: "Record deleted successfully" });
  })
);

export default router;
