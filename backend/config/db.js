import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is missing in environment variables");
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("MongoDB Atlas Connected Successfully");
  } catch (error) {
    console.error("[MongoDB Connection Error]:", error.message);
    throw error;
  }
};
