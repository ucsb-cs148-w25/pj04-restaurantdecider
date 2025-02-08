import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../utils/db.js";
import { authMiddleware } from "./authMiddleware.js";
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  try {
    const existingUsers = await User.findAll({
      where: {
        username: username
      }
    });

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "Username already taken" });
    }

    if (password != confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
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

    // Compare provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create and set a JWT token for authentication
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('auth', token, {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7200000
    }); // 2 hour expiry
    res.status(200).json({
      message: 'User logged in successfully',
      username: user.username
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/auto-login', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      message: 'User auto-logged in successfully',
      username: user.username
    });
  } catch (error) {
    res.status(401).json({ error: 'Auto-login failed' });
  }
});

router.post('/signout', authMiddleware, async (req, res) => {
  try {
    res.clearCookie('auth');
    res.status(200).json({ message: 'User signed out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
