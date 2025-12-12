import mongoose from "mongoose";

const locationReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // optional if guest
  lat: Number,
  lon: Number,
  locationName: String,
  temperature: Number,
  humidity: Number,
  aqi: { type: Number, default: null },
  aiInsight: String,
  riskScore: Number,
  riskLabel: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("LocationReport", locationReportSchema);
