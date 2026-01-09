import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

const app = express();

//express middlewares
app.use(cors());
app.use(express.json());

//auth middleware
app.use("/auth", authRoutes);

export default app;
