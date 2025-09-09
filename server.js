import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
// Routes
import authRoutes from "./routes/auth.js";
import visaRoutes from "./routes/Visa.js";

dotenv.config();
connectDB();

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));




app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/visas", visaRoutes);

// Test route
app.get("/", (req, res) => res.send("API running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
