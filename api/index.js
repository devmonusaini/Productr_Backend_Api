import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from "../config/db.js";
import authRoutes from "../routes/authRoutes.js";
import productRoutes from "../routes/productRoutes.js";
const app = express();
const PORT = process.env.PORT || 5000;
connectDB();
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true
  })
);
app.use(cookieParser());


app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Api running');
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);