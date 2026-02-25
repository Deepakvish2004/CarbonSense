import mongoose from "mongoose";

const EmissionSchema = new mongoose.Schema({
  userId: String,
  source: String,
  cpuLoad: Number,
  batteryPercent: Number,
  powerUsage: Number,
  co2Emission: Number,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Emission", EmissionSchema);
