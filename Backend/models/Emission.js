// backend/models/Emission.js
const mongoose = require("mongoose");

const EmissionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  cpuLoad: Number,
  batteryPercent: Number,
  co2Emission: Number,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Emission", EmissionSchema);
