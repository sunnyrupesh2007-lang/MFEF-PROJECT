import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import doctorDashboardRoutes from "./routes/doctorDashboardRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers
app.use(helmet());

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// Middleware
app.use(express.json({ limit: "10kb" }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// General API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

// Authentication Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    app: "Medibook Doctor Appointment API",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctor-dashboard", doctorDashboardRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Server Error]:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "An internal error occurred."
        : err.message,
  });
});

// Start Server After Database Connection
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Medibook Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
