import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import createError from "http-errors";
import { fileURLToPath } from "url";
import { initializeDB } from "./utils/db.js";
import cors from "cors";

// custom modules
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import mapsRouter from "./routes/maps.js";
import rankingRouter from "./routes/ranking.js";

import dotenv from 'dotenv'
dotenv.config()
// console.log('Google Maps API Key:', process.env.MAPS_API_KEY);
// allows us to use ES module syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// initialize db
initializeDB();

// Set up the Express app
const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://cs148.tanaybiradar.com' : 'http://localhost:5173',
  credentials: true,
  exposedHeaders: ["set-cookie"]
}))

// Add Content Security Policy headers
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com; connect-src 'self' http: https:; img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://lh3.googleusercontent.com https://*.googleusercontent.com; style-src 'self' 'unsafe-inline' https://*.googleapis.com; font-src 'self' https://*.gstatic.com;"
  );
  next();
});
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/maps", mapsRouter);
app.use("/api/ranking", rankingRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

const port = process.env.PORT || 3000; // Using environment variable PORT, fallback to 3000

export default app;
