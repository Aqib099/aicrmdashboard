import mongoose from "mongoose";

export const connectDB = async () => {
    const uri = process.env.MONGO_URI;

    if(!uri){
        throw new Error("MONGO_URI is not defined in the environment variables");
    }

    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000, // Set a timeout for server selection
    });

    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    return conn;
}