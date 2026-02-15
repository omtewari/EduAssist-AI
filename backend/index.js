import dotenv from 'dotenv';
dotenv.config();

import express from 'express';

import cors from 'cors';
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoutes.js';
import documentRouter from './routes/documentRoutes.js'



const app = express()

//DATABASE CONNECTION
connectDB();

app.use(cors());
app.use(express.json());





app.use('/api/auth',authRoutes);
app.use("/api/documents", documentRouter);

app.get('/',(req,res)=>{
    res.send("hello World");
})

const port=process.env.PORT ;

app.listen(port, () => {
    console.log(`server is running on ${port}`);
})

export default app;