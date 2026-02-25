import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema(
  {
    /* =========================
       ADMIN CONFIG (GLOBAL)
       ========================= */
    isSetting: {
      type: Boolean,
      default: false, // only ONE document should be true
    },

    alert10: {
      type: Number,
      default: 10,
    },

    alert15: {
      type: Number,
      default: 15,
    },

    enabled: {
      type: Boolean,
      default: true,
    },

    /* =========================
       USER-SPECIFIC ALERTS
       ========================= */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    message: {
      type: String,
      default: "",
      trim: true,
    },

    alertType: {
      type: String,
      enum: ["EMISSION", "LOGIN_REMINDER"],
      default: "LOGIN_REMINDER",
    },

    // 🔄 ADMIN → USER FLOW
    status: {
      type: String,
      enum: ["Pending", "Responded"],
      default: "Pending",
    },

    userResponse: {
      type: String,
      enum: ["Active", "Inactive", null],
      default: null,
    },

    // 🔔 REMINDER TRACKING (CRITICAL)
    reminderCount: {
      type: Number,
      default: 1,
    },

    lastSentAt: {
      type: Date,
      default: Date.now,
    },

    autoEmailSent: {
      type: Boolean,
      default: false,
    },

    /* =========================
       LEGACY EMISSION FLAGS
       ========================= */
    alert10Sent: {
      type: Boolean,
      default: false,
    },

    alert15Sent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* ✅ SAFE EXPORT (prevents overwrite error) */
const Alert =
  mongoose.models.Alert || mongoose.model("Alert", AlertSchema);

export default Alert;
