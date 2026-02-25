import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware.js";
import Waste from "../models/Waste.js";

const router = express.Router();

/* -----------------------------------------------
   EMISSION FACTORS (kg CO₂ per unit/kg)
------------------------------------------------*/

const baseFactors = {
  Laptop: 200,
  Desktop: 350,
  Monitor: 150,
  Battery: 8,       // per kg
  Cable: 2,         // per kg
  Motherboard: 120,
};

/* -----------------------------------------------
   TREATMENT MODIFIERS
------------------------------------------------*/

const treatmentModifiers = {
  Recycled: 0.8,
  Disposed: 1.2,
  Donated: 0.6,
  Reused: 0.4,
};

/**
 * @route   POST /api/waste/calculate
 * @desc    Calculate and save waste emission
 * @access  Private
 */
router.post(
  "/calculate",
  protect,
  asyncHandler(async (req, res) => {
    const { facility, year, month, wasteType, treatmentType, unit, amount } = req.body;

    // Validate fields
    if (!facility || !year || !month || !wasteType || !treatmentType || !unit || !amount) {
      res.status(400);
      throw new Error("All fields are required");
    }

    if (!baseFactors[wasteType]) {
      res.status(400);
      throw new Error("Invalid waste type");
    }

    // Base factor
    const baseEmission = baseFactors[wasteType];

    // Treatment modifier
    const modifier = treatmentModifiers[treatmentType] || 1;

    // Amount conversion
    let finalAmount = Number(amount);

    if (unit === "Tons") {
      finalAmount *= 1000; // convert tons → kg
    }

    // Final CO2 formula
    const co2Emission = baseEmission * finalAmount * modifier;

    // Save record
    const record = await Waste.create({
      user: req.user._id,
      facility,
      year,
      month,
      wasteType,
      treatmentType,
      unit,
      amount,
      co2Emission,
    });

    res.status(201).json({
      message: "Waste record added successfully",
      co2Emission,
      record,
    });
  })
);

/**
 * @route   GET /api/waste/history
 * @desc    Get all user waste records
 * @access  Private
 */
router.get(
  "/history",
  protect,
  asyncHandler(async (req, res) => {
    const records = await Waste.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(records);
  })
);

/**
 * @route   DELETE /api/waste/:id
 * @desc    Delete a record
 * @access  Private
 */
router.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const record = await Waste.findById(req.params.id);

    if (!record) {
      res.status(404);
      throw new Error("Record not found");
    }

    if (record.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error("Not authorized");
    }

    await record.deleteOne();

    res.json({ message: "Waste record deleted successfully" });
  })
);

export default router;
