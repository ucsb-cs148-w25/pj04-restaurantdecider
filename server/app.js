import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import createError from 'http-errors'
import { fileURLToPath } from 'url'

// custom modules
import { DuckDBInstance } from '@duckdb/node-api'

// include routers
import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'

// allows us to use ES module syntax
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// set up database
const dbInstance = await DuckDBInstance.create('./data/db.duckdb')
export const db = await dbInstance.connect()

await db.run(`
  CREATE TABLE IF NOT EXISTS USERS (
    username VARCHAR,
    hashedPassword VARCHAR
  )
`);

// // DEBUG: Function to get all table names
// export async function getAllTableNames() {
//   const result = await db.run(`
//     SELECT table_name 
//     FROM information_schema.tables 
//     WHERE table_schema = 'main'
//   `);
//   const chunks = await result.fetchAllChunks();
//   const tableNames = chunks.flatMap(chunk => chunk.getRows().map(row => row[0]));
//   console.log('Tables in database:', tableNames);
//   return tableNames;
// }
// const tableNames = await getAllTableNames();

var app = express();

// view engine setup
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
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
