import { MongoClient } from "mongodb";

let client;
let db;

const connectDB = async () => {
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI);
    db = client.db("plp_bookstore");
    console.log(`MongoDB Connected (Native Driver)`.cyan.underline.bold);
  } catch (error) {
    console.error(`Connection Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!db) throw new Error("Database not connected");
  return db;
};

export const closeDB = () => client?.close();

export default connectDB;