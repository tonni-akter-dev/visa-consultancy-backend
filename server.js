import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import dns from "dns";
import authRoutes from "./routes/auth.js";
import visaRoutes from "./routes/Visa.js";
import evisaRoutes from "./routes/evisa.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();
connectDB();

const app = express();
app.use(cors());

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/visas", visaRoutes);
app.use("/api/evisa", evisaRoutes);

// Test route
app.get("/", (req, res) => res.send("API running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
