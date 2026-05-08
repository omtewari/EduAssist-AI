import dotenv from 'dotenv';
dotenv.config();

import express from 'express';

import cors from 'cors';
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoutes.js';
import documentRouter from './routes/documentRoutes.js'
import flashcardRoutes from './routes/flashcardRoutes.js'
import keyTopicRoutes from './routes/keyTopicRoutes.js'



const app = express()

//DATABASE CONNECTION
connectDB();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());





app.use('/api/auth',authRoutes);
app.use("/api/documents", documentRouter);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/keytopics",keyTopicRoutes);

app.get('/',(req,res)=>{
    res.send("hello World");
})

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

const port=process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`server is running on ${port}`);
})

export default app;