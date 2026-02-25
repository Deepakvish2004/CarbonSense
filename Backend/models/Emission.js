const mongoose = require("mongoose");

const EmissionSchema = new mongoose.Schema({
  userId: String,
  source: String,
  cpuLoad: Number,
  batteryPercent: Number,
  powerUsage: Number,
  co2Emission: Number,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Emission", EmissionSchema);
