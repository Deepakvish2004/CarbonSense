import express from "express";
import asyncHandler from "express-async-handler";
import Footprint from "../models/footprintModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/footprint/calculate
 * @desc    Calculate CO₂ emission & store record (MANUAL INPUT)
 * @access  Protected
 */
router.post(
  "/calculate",
  protect,
  asyncHandler(async (req, res) => {
    let { deviceType, deviceName, powerRating, usageHours } = req.body;

    
    if (!deviceType || powerRating == null || usageHours == null) {
      return res.status(400).json({
        success: false,
        message: "deviceType, powerRating and usageHours are required",
      });
    }

    
    deviceType = deviceType.trim();
    deviceName = deviceName?.trim() || null;

    
    const pwr = Number(powerRating);
    const hrs = Number(usageHours);

    if (isNaN(pwr) || isNaN(hrs)) {
      return res.status(400).json({
        success: false,
        message: "Power rating and usage hours must be numbers",
      });
    }

  
    if (pwr < 1 || pwr > 5000) {
      return res.status(400).json({
        success: false,
        message: "Power rating must be between 1 and 5000 watts",
      });
    }

    if (hrs <= 0 || hrs > 24) {
      return res.status(400).json({
        success: false,
        message: "Usage hours must be between 1 and 24",
      });
    }

    
    const kWh = (pwr * hrs) / 1000;
    const EMISSION_FACTOR = 0.82; 
    const co2Emission = Number((kWh * EMISSION_FACTOR).toFixed(3));

    
    const emissionRate = co2Emission / hrs;
    let efficiency = 5;

    if (emissionRate > 0.3 && emissionRate <= 0.6) efficiency = 4;
    else if (emissionRate > 0.6 && emissionRate <= 1.0) efficiency = 3;
    else if (emissionRate > 1.0 && emissionRate <= 2.0) efficiency = 2;
    else if (emissionRate > 2.0) efficiency = 1;

    
    const newFootprint = await Footprint.create({
      user: req.user._id,
      deviceType,
      deviceName,
      powerRating: pwr,
      usageHours: hrs,
      co2Emission,
      efficiency,
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
 * @desc    Get logged-in user's CO₂ history
 * @access  Protected
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
 * @desc    Delete a footprint record
 * @access  Protected
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
    res.json({
      success: true,
      message: "Record deleted successfully",
    });
  })
);

export default router;
