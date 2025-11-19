// backend/middleware/auth.js
import jwt from "jsonwebtoken";
import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = getDB();
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) });

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || "",
      bio: user.bio,
      isOnline: user.isOnline,
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};