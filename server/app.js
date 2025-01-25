import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import createError from 'http-errors';
import { fileURLToPath } from 'url';
import { DuckDBInstance } from '@duckdb/node-api';

// custom modules
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';

// allows us to use ES module syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// initialize db
let db;  // db will be a reference to the connection object

async function connectDB() {
  try {
    const dbInstance = await DuckDBInstance.create('./data/db.duckdb');
    db = await dbInstance.connect();

    await db.run(`
      CREATE TABLE IF NOT EXISTS USERS (
        username VARCHAR,
        hashedPassword VARCHAR
      )
    `);

    console.log('Connected to DuckDB successfully');
  } catch (err) {
    console.error('Error connecting to DuckDB', err);
  }
}

// call connectDB to establish the connection on app startup
connectDB();

// Function to get db connection
export function getDbConnection() {
  if (!db) {
    throw new Error('Database not connected yet');
  }
  return db;
}

// Set up the Express app
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

const port = process.env.PORT || 3000;  // Using environment variable PORT, fallback to 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


export default app;
