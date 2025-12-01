import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema({
  // ADMIN CONFIG DOCUMENT (only one record with isSetting: true)
  isSetting: { type: Boolean, default: false },

  // Admin editable thresholds
  alert10: { type: Number, default: 10 },  // first alert
  alert15: { type: Number, default: 15 },  // critical alert
  enabled: { type: Boolean, default: true }, // admin can turn alerts ON/OFF

  // USER-SPECIFIC ALERT STATUS
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  alert10Sent: { type: Boolean, default: false }, // one-time
  alert15Sent: { type: Boolean, default: false }, // every login but tracking stored

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Alert", AlertSchema);
