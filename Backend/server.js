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

import chatRoutes from "./routes/chatRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import aqiRoutes from "./routes/aqiRoutes.js";
import locationReportRoutes from "./routes/locationReportRoutes.js";


// ------------------ INITIALIZE APP ------------------
const app = express();

// ------------------ MIDDLEWARE ------------------
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// ------------------ ROUTES ------------------

// ✅ FIRST: Admin Auth (NO TOKEN REQUIRED)
app.use("/api/admin/auth", adminAuthRoutes);

// ✅ SECOND: Protected Admin Routes
app.use("/api/admin", adminRoutes);

// OPTIONAL Activity routes (also protected)
app.use("/api/admin/activity", adminActivityRoutes);

// User + footprint
app.use("/api/users", userRoutes);
app.use("/api/footprint", footprintRoutes);

// Waste management
app.use("/api/waste", wasteRoutes);

// Alerts
app.use("/api/alert", alertRoutes);
app.use("/api/alert", alertSettingsRoutes);

// Predictions
app.use("/api/predict", predictionRoutes);

// Chat
app.use("/api/chat", chatRoutes);
app.use("/api/location", locationRoutes);
app.use("/api", aqiRoutes);
app.use("/api/location", locationReportRoutes);


// ------------------ START SERVER ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
