import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "usermembers",
    required: true,
  },
  messages: [
    {
      role: { type: String, enum: ["user", "assistant"], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

export default mongoose.model("Chat", chatSchema);
