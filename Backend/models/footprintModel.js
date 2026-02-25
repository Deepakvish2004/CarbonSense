import mongoose from "mongoose";

const footprintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    deviceType: {
      type: String,
      required: true, // ✅ manual text allowed
      trim: true,
    },

    deviceName: {
      type: String,
      default: null,
      trim: true,
    },

    powerRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5000,
    },

    usageHours: {
      type: Number,
      required: true,
      min: 0,
      max: 24,
    },

    co2Emission: {
      type: Number,
      required: true,
    },

    efficiency: {
      type: Number,
      default: 3,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Footprint", footprintSchema);
