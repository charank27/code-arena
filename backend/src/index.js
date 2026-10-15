const express = require("express");
require('dotenv').config();
const cookieParser = require("cookie-parser");
const main = require("./config/db");
const User = require('./models/user');
const authRouter = require("./routes/userAuth");
const problemRouter = require("./routes/problemCRUD");
const submitRouter = require("./routes/submit");
const redisClient = require("./config/redis");
const cors = require("cors");
const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000"
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app") || process.env.NODE_ENV !== "production") {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);

const initializeConnection = async () => {
    try {
        await main();
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("MongoDB connection warning: " + err.message);
    }

    try {
        await redisClient.connect();
    } catch (err) {
        console.warn("Redis connection warning: " + err.message);
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log("listening at port number " + PORT);
    });
};

initializeConnection();

