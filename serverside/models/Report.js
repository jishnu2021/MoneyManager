import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "usermembers",
    required: true,
  },
  period: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  totalIncome: {
    type: Number,
    default: 0,
  },
  totalExpense: {
    type: Number,
    default: 0,
  },
  netSavings: {
    type: Number,
    default: 0, // totalIncome - totalExpense
  },
  breakdown: {
    byCategory: [
      {
        category: String,
        income: { type: Number, default: 0 },
        expense: { type: Number, default: 0 },
      },
    ],
    byPaymentMethod: [
      {
        method: String, // e.g. Cash, UPI, Card
        income: { type: Number, default: 0 },
        expense: { type: Number, default: 0 },
      },
    ],
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  format: {
    type: String,
    enum: ["pdf", "csv", "xlsx"],
    default: "pdf",
  },
  fileUrl: {
    type: String,
    default: null,
  },
});

export default mongoose.model("Report", reportSchema);
