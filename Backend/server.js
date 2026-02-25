import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Load env
dotenv.config();

// DB
import connectDB from "./config/db.js";
connectDB();

// ---------------- ROUTES ----------------
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminActivityRoutes from "./routes/adminActivityRoutes.js";

import footprintRoutes from "./routes/footprintRoutes.js";
import wasteRoutes from "./routes/wasteRoutes.js";
import alertRoutes from "./routes/checkAlertRoutes.js";
import alertSettingsRoutes from "./routes/alertSettingsRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import aqiRoutes from "./routes/aqiRoutes.js";
import locationReportRoutes from "./routes/locationReportRoutes.js";
import emissionRoutes from "./routes/emissionRoutes.js";
import emissionWidgetRoutes from "./routes/emissionWidgetRoutes.js";

const app = express();

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// ---------------- API ROUTES ----------------
app.use("/api/users", userRoutes);          // ✅ USER (alerts, login, register)
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/activity", adminActivityRoutes);

app.use("/api/footprint", footprintRoutes);
app.use("/api/waste", wasteRoutes);

app.use("/api/alert", alertRoutes);
app.use("/api/alert", alertSettingsRoutes);

app.use("/api/predict", predictionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/location", locationRoutes);
app.use("/api", aqiRoutes);
app.use("/api/location", locationReportRoutes);

app.use("/api/emission", emissionRoutes);
app.use("/api/emission-widget", emissionWidgetRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API running successfully");
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
