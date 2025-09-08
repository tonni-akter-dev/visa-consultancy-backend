import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/auth.js";
import visaRoutes from "./routes/Visa.js";

dotenv.config();
connectDB();

const app = express();

// Define the CORS options
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:80"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));


app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/visas", visaRoutes);

// Test route
app.get("/", (req, res) => res.send("API running..."));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));