import express from "express";
import bcrypt from "bcryptjs";
// import jwt from 'jsonwebtoken';
import { getDbConnection } from "../app.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  let db = getDbConnection();

  try {
    const result = await db.run("SELECT * FROM USERS WHERE username = ?", [
      username,
    ]);
    const rows = await result.fetchAllChunks();
    const existingUser = rows.length > 0 && rows[0].rowCount > 0;
    console.log(rows);
    rows.forEach(row => {
      console.log(row.username, row.hashedPassword); // Replace with actual column names
    });

    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.run("INSERT INTO USERS (username, hashedPassword) VALUES (?, ?)", [
      username,
      hashedPassword,
    ]);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// User Login (POST /login)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  let db = getDbConnection();

  try {
    // Get the user by username
    const user = await db.run("SELECT * FROM USERS WHERE username = ?", [
      username,
    ]);
    const rows = await user.fetchAllChunks();
    console.log(rows)
    const res = rows.flatMap(chunk => chunk.getRows())
    console.log('User found:', res);
    res.forEach(row => {
      console.log(row[0], row[1]); // Replace with actual column names
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // console.log('password:', password);
    // console.log('username:', res.username);
    console.log('user password:', res[1]);
    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, res.hashedPassword);
    console.log('jhkjkh');
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('here');

    // Generate JWT token
    const token = jwt.sign({ username: user.username }, 'your_jwt_secret_key', { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// router.get('/users', async (req, res) => {
//   try {
//     const db = getDbConnection();
//     const users = await db.all('SELECT * FROM USERS');
//     res.status(200).json(users);
//   } catch (error) {
//     console.error('Error retrieving users:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

export default router;
