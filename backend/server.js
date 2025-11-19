import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import colors from "colors";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import multer from "multer";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";
// Add this import
import userRoutes from "./routes/user.js";

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Imports
import connectDB, { getDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/post.js";
import { protect } from "./middleware/auth.js";   // ← Only once!

dotenv.config();
await connectDB();

const app = express();
const httpServer = createServer(app);

// ==================== SOCKET.IO SETUP ====================
const io = new SocketServer(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

const onlineUsers = new Map();

io.on("connection", async (socket) => {
  const userId = socket.user.id;
  console.log(`User connected: ${userId}`.green);

  socket.join(userId);
  onlineUsers.set(userId, socket.id);

  const db = getDB();
  await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { isOnline: true, lastSeen: new Date() } }
  );

  socket.broadcast.emit("userOnline", userId);

  // Events
  socket.on("sendMessage", async ({ to, text }) => {
    const message = {
      _id: new ObjectId(),
      from: userId,
      to,
      text,
      createdAt: new Date(),
      seen: false,
    };
    await db.collection("messages").insertOne(message);
    io.to(to).emit("newMessage", message);
    socket.emit("newMessage", message);
  });

  socket.on("typing", ({ to }) => socket.to(to).emit("typing", { from: userId }));
  socket.on("stopTyping", ({ to }) => socket.to(to).emit("stopTyping", { from: userId }));

  socket.on("newPost", (post) => socket.broadcast.emit("newPost", post));
  socket.on("likePost", (data) => socket.broadcast.emit("likeUpdate", data));
  socket.on("newComment", (data) => socket.broadcast.emit("newComment", data));

  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${userId}`.red);
    onlineUsers.delete(userId);
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { isOnline: false, lastSeen: new Date() } }
    );
    socket.broadcast.emit("userOffline", userId);
  });
});

// ==================== EXPRESS SETUP ====================
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", upload.single("image"), postRoutes);  // protect is inside postRoutes

// Add this line with other routes
app.use("/api/users", userRoutes);

// Avatar Upload Route
app.post("/api/upload/avatar", protect, upload.single("avatar"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const avatarUrl = `/uploads/${req.file.filename}`;

  try {
    const db = getDB();
    await db.collection("users").updateOne(
      { _id: new ObjectId(req.user._id) },
      { $set: { avatar: avatarUrl } }
    );
    res.json({ success: true, avatar: avatarUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

app.get("/", (req, res) => {
  res.send("SocialX Backend Running — Avatar Uploads + Real-time Chat + Posts 🔥");
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server + Socket.IO running on http://localhost:${PORT}`.yellow.bold);
});