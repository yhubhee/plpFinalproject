// backend/routes/user.js
import express from "express";
import { getDB } from "../config/db.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET /api/users → Get all users (for chat list)
router.get("/", protect, async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection("users")
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;