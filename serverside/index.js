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
import './config/passport.js';


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
app.use('/api',useranalytics)
app.use('/api',userexport)

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });
});