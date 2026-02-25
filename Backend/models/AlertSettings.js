import mongoose from "mongoose";

const alertSettingsSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    alert10: { type: Number, default: 10 },
    alert15: { type: Number, default: 15 },
  },
  { timestamps: true }
);

export default mongoose.model("AlertSettings", alertSettingsSchema);
