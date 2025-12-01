import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    action: { type: String, required: true },
    target: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);
