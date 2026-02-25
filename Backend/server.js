import express from "express";
import dotenv from "dotenv";

// Load env FIRST
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

// ─────────────────────────────────────────────────────────────
//  MANUAL CORS MIDDLEWARE  (works on Vercel serverless)
//  Must be FIRST — before all routes
// ─────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://carbon-sense-64sa.vercel.app",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (!origin || ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization"
  );

  // Respond 204 immediately for all OPTIONS preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

app.use(express.json());

// ---------------- API ROUTES ----------------
app.use("/api/users", userRoutes);
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

// Health check
app.get("/", (req, res) => {
  res.send("CarbonSense API running ✅");
});

// For local dev
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

// ← REQUIRED for Vercel serverless (@vercel/node)
export default app;
