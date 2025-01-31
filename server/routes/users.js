import express from "express";
import bcrypt from "bcryptjs";
import { db, User } from "../utils/db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUsers = await User.findAll({
      where: {
        username: username
      }
    });

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username: username,
      hashedPassword: hashedPassword
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// User Login (POST /login)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Get the user by username
    const user = await User.findOne({
      where: {
        username: username
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.hashedPassword);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({ message: "User logged in successfully" });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
