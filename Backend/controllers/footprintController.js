import Footprint from "../models/footprintModel.js";

// ================= SAVE FOOTPRINT =================
export const calculateFootprint = async (req, res) => {
  try {
    let { deviceType, deviceName, powerRating, usageHours } = req.body;

    // ✅ BASIC VALIDATION
    if (!deviceType || powerRating == null || usageHours == null) {
      return res.status(400).json({
        success: false,
        message: "deviceType, powerRating and usageHours are required",
      });
    }

    // ✅ FORCE NUMBER CONVERSION
    powerRating = Number(powerRating);
    usageHours = Number(usageHours);

    if (isNaN(powerRating) || powerRating <= 0 || powerRating > 5000) {
      return res.status(400).json({ message: "Invalid power rating" });
    }

    if (isNaN(usageHours) || usageHours <= 0 || usageHours > 24) {
      return res.status(400).json({ message: "Invalid usage hours" });
    }

    // ✅ ENERGY & CO₂ CALCULATION
    const energy = (powerRating * usageHours) / 1000; // kWh
    const EMISSION_FACTOR = 0.82; // kg CO₂ per kWh (India avg)
    const co2Emission = Number((energy * EMISSION_FACTOR).toFixed(3));

    // ✅ SAVE
    const record = await Footprint.create({
      user: req.user._id,
      deviceType: deviceType.trim(),
      deviceName: deviceName?.trim() || null,
      powerRating,
      usageHours,
      co2Emission,
    });

    res.status(201).json({
      success: true,
      message: "Calculation saved successfully",
      record,
    });

  } catch (err) {
    console.error("❌ Error saving footprint:", err);
    res.status(500).json({
      success: false,
      message: "Failed to calculate",
    });
  }
};

// ================= FETCH USER HISTORY =================
export const getHistory = async (req, res) => {
  try {
    const data = await Footprint.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Error fetching history:", err);
    res.status(500).json({
      message: "Failed to fetch history",
    });
  }
};
