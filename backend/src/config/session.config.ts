// session.config.ts
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";

dotenv.config();

// Make sure your MONGO_URI is set in .env
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("MONGO_URI is not set in the environment variables");
}

// Make sure your SESSION_SECRET is set in .env
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is not set in the environment variables");
}

// Session configuration
export const sessionOptions: session.SessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  proxy: process.env.NODE_ENV === "production",

  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    dbName: "projectbookmystills", // Replace with your actual DB name if different
    collectionName: "sessions",
    ttl: 24 * 60 * 60, // Session expiry in seconds (1 day)
  }),

  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day in milliseconds
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Only use HTTPS in production
    sameSite: "lax",
  },
};
