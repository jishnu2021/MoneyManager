import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "usermembers",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["income", "expense"], 
    required: true,
  },
  category: {
    type: String,
    default: null,
  },
  source: {
    type: String,
    default: null,
  },
  paymentMethod: {
    type: String,
    default: null,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true // auto adds createdAt, updatedAt
});

export default mongoose.model("Transaction", transactionSchema);
