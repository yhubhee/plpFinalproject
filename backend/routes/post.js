// backend/routes/post.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// POST /api/posts → Create post with optional image (from multer in server.js)
router.post("/", protect, async (req, res) => {
  const { text } = req.body;
  const file = req.file;  // ← multer puts it here

  if (!text && !file) {
    return res.status(400).json({ message: "Post cannot be empty" });
  }

  try {
    let imageUrl = "";
    if (file) {
      imageUrl = `/uploads/${file.filename}`;  // ← local path
    }

    const db = getDB();
    const result = await db.collection("posts").insertOne({
      userId: req.user._id,
      text: text || "",
      image: imageUrl,
      likes: [],
      comments: [],
      createdAt: new Date(),
    });

    const newPost = {
      _id: result.insertedId,
      text: text || "",
      image: imageUrl,
      user: req.user,
      likes: [],
      comments: [],
      createdAt: new Date(),
    };

    res.status(201).json({
      success: true,
      post: newPost,
    });
  } catch (err) {
    console.error("Post creation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/posts/feed
router.get("/feed", protect, async (req, res) => {
  try {
    const db = getDB();
    const posts = await db.collection("posts")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        { $project: { "user.password": 0 } },
        { $sort: { createdAt: -1 } }
      ])
      .toArray();

    res.json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/posts/:id/like
router.post("/:id/like", protect, async (req, res) => {
  try {
    const postId = new ObjectId(req.params.id);
    const userId = req.user._id;
    const db = getDB();

    const post = await db.collection("posts").findOne({ _id: postId });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const likes = post.likes || [];
    const hasLiked = likes.some(id => id.toString() === userId.toString());

    if (hasLiked) {
      await db.collection("posts").updateOne(
        { _id: postId },
        { $pull: { likes: userId } }
      );
    } else {
      await db.collection("posts").updateOne(
        { _id: postId },
        { $push: { likes: userId } }
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/posts/:id/comment
router.post("/:id/comment", protect, async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ message: "Comment cannot be empty" });

  try {
    const postId = new ObjectId(req.params.id);
    const db = getDB();

    const comment = {
      _id: new ObjectId(),
      userId: req.user._id,
      user: {
        _id: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar || ""
      },
      text: text.trim(),
      createdAt: new Date(),
    };

    await db.collection("posts").updateOne(
      { _id: postId },
      { $push: { comments: comment } }
    );

    res.json({ success: true, comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;