import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import connectDB from "./config/Db.js";
import userRoutes from './routes/userRoutes.js';
import transactionroute from './routes/transaction-routes.js'
import usergoals from './routes/goalsroute.js'
import useranalytics from './routes/analyticsroute.js'
import userexport from './routes/exportroute.js'
import userchat from './routes/chatroutes.js'
import userbills from './routes/bills-route.js'
import cron from "node-cron";
import './config/passport.js';
import userprofile from './routes/userProfile.js'
import Bill from "./models/BillsModel.js";
import User from "./models/User.js";
import { sendEmail } from "./utils/email.js";

// Run every day at 9 AM
cron.schedule("0 9 * * *", async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const bills = await Bill.find({
    dueDate: tomorrow,
    status: { $in: ["pending", "overdue"] }
  }).populate("userId", "email");

  for (const bill of bills) {
    await sendEmail(
      bill.userId.email,
      "Bill Due Reminder",
      `Your bill "${bill.title}" of ₹${bill.amount} is due tomorrow.`,
      `<p>Hello,</p><p>Your bill <b>${bill.title}</b> of <b>₹${bill.amount}</b> is due tomorrow.</p>`
    );
  }
});


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true, 
  })
);

// Session middleware (required for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'moneymanage',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));


app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', userRoutes);
app.use('/api',transactionroute);
app.use('/api',usergoals);
app.use('/api',useranalytics);
app.use('/api',userexport);
app.use('/api',userchat);
app.use('/api/bills',userbills)
app.use('/api',userprofile)

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });
});