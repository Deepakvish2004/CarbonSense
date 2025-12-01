// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Load ENV
dotenv.config();

// Database connection
import connectDB from "./config/db.js";
connectDB();

// ------------------ IMPORT ROUTES ------------------
import footprintRoutes from "./routes/footprintRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import adminRoutes from "./routes/adminRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminActivityRoutes from "./routes/adminActivityRoutes.js";

import wasteRoutes from "./routes/wasteRoutes.js";
import alertRoutes from "./routes/checkAlertRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js"; 
import alertSettingsRoutes from "./routes/alertSettingsRoutes.js";



// ------------------ INITIALIZE APP ------------------
const app = express();

// ------------------ MIDDLEWARE ------------------
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// ------------------ ROUTES ------------------

// Admin sections
app.use("/api/admin", adminRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/activity", adminActivityRoutes);

// User + footprint
app.use("/api/users", userRoutes);
app.use("/api/footprint", footprintRoutes);

// Waste management
app.use("/api/waste", wasteRoutes);

// High emission email alert (10KG/15KG)
app.use("/api/alert", alertRoutes);

// Prediction API
app.use("/api/predict", predictionRoutes);
app.use("/api/alert", alertSettingsRoutes);




// ------------------ START SERVER ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
