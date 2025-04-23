import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import historyRoutes from "./routes/history.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/history", historyRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
  })
  .catch((err) => console.error("DB connection error:", err));
