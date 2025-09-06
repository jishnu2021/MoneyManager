import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
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
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "paid", "overdue"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    default: null, 
  },
  notes: {
    type: String,
    trim: true,
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction", // link to expense transaction once paid
    default: null,
  },
}, { timestamps: true });

export default mongoose.model("Bill", billSchema);
