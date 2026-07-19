import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

import authRoutes from "./routes/auth.route.js";
import leadRoutes from "./routes/lead.route.js";
import contactRoutes from "./routes/contact.route.js";
import noteRoutes from "./routes/note.route.js";
import taskRoutes from "./routes/task.route.js";
import aiRoutes from "./routes/ai.route.js";
import analyticsRoutes from "./routes/analytics.route.js"

const app = express();


app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);
app.use(express.json({ limit: "1mb"}));
app.use(express.urlencoded({ extended: true}));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);

app.use("/api/contacts", contactRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/tasks", taskRoutes);

app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

const start = async () => {
    try{
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("Error starting server:", err);
        process.exit(1);
    }
}

start();

export default app;


