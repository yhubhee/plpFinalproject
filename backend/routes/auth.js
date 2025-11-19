// backend/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  try {
    const db = getDB();
    const existingUser = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.collection("users").insertOne({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      avatar: "",
      bio: "Hey there! I'm using SocialX.",
      isOnline: false,
      createdAt: new Date(),
    });

    const token = generateToken(result.insertedId);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: result.insertedId,
        name,
        email,
        avatar: "",
        bio: "Hey there! I'm using SocialX.",
        isOnline: false,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = getDB();
    const user = await db.collection("users").findOne({ email: email.toLowerCase() });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { isOnline: true } }
    );

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
        bio: user.bio,
        isOnline: true,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET CURRENT USER
router.get("/me", protect, async (req, res) => {
  res.json({ user: req.user });
});

export default router;  // ← THIS IS REQUIRED FOR ESM