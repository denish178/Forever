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
    if (process.env.NODE_ENV === "test") {
      throw error;
    }
    process.exit(1);
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
};

export default connectDB;
export { disconnectDB };
