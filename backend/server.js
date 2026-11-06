import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

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

// Security HTTP Headers
app.use(helmet());

// CORS Configuration
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: [
      clientUrl,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  })
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
  res.json({
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

    app.listen(PORT, () => {
      console.log(
        `Medibook Backend Server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
