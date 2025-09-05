import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "usermembers",   // links to your user model
    required: true,
  },
  title: {
    type: String,
    required: true,        // e.g., "Emergency Fund", "Vacation", "Car"
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,          // e.g., "Savings", "Travel", "Education"
    default: "General",
  },
  targetAmount: {
    type: Number,
    required: true,        // how much the user wants to save
  },
  currentAmount: {
    type: Number,
    default: 0,            // will be auto-updated from contributions
  },
  contributions: [
    {
      amount: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  startDate: {
    type: Date,
    default: Date.now,
  },
  deadline: {
    type: Date,            // optional — e.g., vacation date, car purchase date
  },
  status: {
    type: String,
    enum: ["active", "completed", "archived"],
    default: "active",
  }
}, {
  timestamps: true 
});

goalSchema.pre("save", function (next) {
  if (this.contributions && this.contributions.length > 0) {
    this.currentAmount = this.contributions.reduce((sum, c) => sum + c.amount, 0);
  }
  next();
});

export default mongoose.model("Goal", goalSchema);
