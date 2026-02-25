import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: String, enum: ["user", "bot"], required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("ChatMessage", chatSchema);
