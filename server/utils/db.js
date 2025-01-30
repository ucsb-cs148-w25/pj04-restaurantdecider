import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import userSchema from '../models/userModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a single database instance
let db = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../data/db.sqlite3'),
  logging: false // Set to true for SQL query logging
});

let User = db.define('User', userSchema);

// Initialize database
async function initializeDB() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Define models
    User = db.define('user', userSchema);

    // Test the connection
    await db.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models
    await db.sync();
    console.log('Database models synchronized successfully.');
  } catch (err) {
    console.error('Database initialization error:', err);
    throw err;
  }
}

// Export database instance and initialization function
export {
  db,
  User,
  initializeDB
};