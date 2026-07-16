import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

const getMongoUri = async () => {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
  }
  return mongoServer.getUri();
};

const connectDB = async () => {
  try {
    const mongoUri = await getMongoUri();
    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
