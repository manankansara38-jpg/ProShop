import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    // Debug: log the database name and the MONGODB_URI environment variable
    console.log(`MongoDB DB: ${conn.connection.name}`);
    console.log(`MONGODB_URI: ${process.env.MONGODB_URI}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
