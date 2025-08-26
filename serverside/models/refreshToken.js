import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true }, // Optional, auto-expiry
});
 const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
 
export default RefreshToken; // ✅ default export
