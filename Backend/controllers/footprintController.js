import Footprint from "../models/footprintModel.js";

// Save footprint for a specific user
export const calculateFootprint = async (req, res) => {
  try {
    const { deviceType, powerRating, usageHours } = req.body;
    const energy = (powerRating * usageHours) / 1000; // kWh
    const co2Emission = energy * 0.82; // kg CO₂ per kWh

    const record = await Footprint.create({
      user: req.user._id,
      deviceType,
      powerRating,
      usageHours,
      co2Emission,
    });

    res.json({ message: "Calculation saved", record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch history for logged-in user only
export const getHistory = async (req, res) => {
  try {
    const data = await Footprint.find({ user: req.user._id }).sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
