// backend/isolatedDB/db.js
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

const connectDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: "test" });
  console.log("✅ In-memory MongoDB connected");
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
  console.log("🛑 In-memory MongoDB stopped");
};

const clearDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  console.log("🧹 Database cleared");
};

export { connectDB, closeDB, clearDB };
