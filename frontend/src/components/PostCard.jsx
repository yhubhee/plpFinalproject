// frontend/src/pages/dashboard/components/PostCard.jsx
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function PostCard({ post, onUpdate }) {
  const [liked, setLiked] = useState(post.likes.includes(post.user._id));
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [comment, setComment] = useState("");

  const handleLike = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/posts/${post._id}/like`);
      setLiked(!liked);
      setLikesCount(prev => liked ? prev - 1 : prev + 1);
    } catch (err) {
      toast.error("Like failed");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/posts/${post._id}/comment`, { text: comment });
      setComment("");
      onUpdate();
      toast.success("Comment added!");
    } catch (err) {
      toast.error("Comment failed");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
            {post.user.name[0]}
          </div>
          <div>
            <h3 className="font-bold">{post.user.name}</h3>
            <p className="text-sm text-gray-500">Just now</p>
          </div>
        </div>
      </div>

      {/* Post Content */}
      {post.text && <p className="px-6 text-lg">{post.text}</p>}
      {post.image && (
        <img src={post.image} alt="post" className="w-full mt-4" />
      )}

      {/* Actions */}
      <div className="p-6 pt-4">
        <div className="flex items-center justify-between text-gray-600">
          <button onClick={handleLike} className="flex items-center gap-2 hover:text-red-600 transition">
            <Heart className={`w-6 h-6 ${liked ? "fill-red-600 text-red-600" : ""}`} />
            <span>{likesCount} Likes</span>
          </button>
          <button className="flex items-center gap-2 hover:text-purple-600 transition">
            <MessageCircle className="w-6 h-6" />
            <span>{post.comments.length} Comments</span>
          </button>
          <button className="hover:text-blue-600 transition">
            <Share2 className="w-6 h-6" />
          </button>
        </div>

        {/* Comment Input */}
        <form onSubmit={handleComment} className="mt-6 flex gap-3">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}