// import express from "express";
// import cors from "cors";
// import morgan from "morgan";
// import cookieParser from "cookie-parser";
// import dotenv from "dotenv";
// import connectDB from "./config/Db.js";
// import userRoutes from './routes/userRoutes.js'

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(
//   cors({
//     origin: "http://localhost:5173", 
//     credentials: true, 
//   })
// );
// app.use(express.json());
// app.use(cookieParser());
// app.use(morgan("dev"));


// app.use('/api/auth',userRoutes)


// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`✅ Server running at http://localhost:${PORT}`);
//   });
// });

import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import connectDB from "./config/Db.js";
import userRoutes from './routes/userRoutes.js';
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

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });
});