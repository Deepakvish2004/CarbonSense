import mongoose from "mongoose";

const footprintSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deviceType: { type: String, required: true },
    powerRating: { type: Number, required: true },
    usageHours: { type: Number, required: true },
    co2Emission: { type: Number, required: true },
    efficiency: { type: Number, default: 3 },

    // 🗓️ Custom date field - always saved even if not manually passed
    date: {
      type: Date,
      default: Date.now, // ensures every new record has a "date"
    },
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

export default mongoose.model("Footprint", footprintSchema);
