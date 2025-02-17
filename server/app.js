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
  origin: "*",
  credentials: true,
  exposedHeaders: ["set-cookie"]
}))
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
