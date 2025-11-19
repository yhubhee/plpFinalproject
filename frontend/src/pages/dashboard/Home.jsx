// frontend/src/pages/dashboard/Home.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import CreatePostModal from "../../components/CreatePostModal";     // ← CORRECT
import PostCard from "../../components/PostCard";                   // ← CORRECT
import { useAuth } from "../../context/AuthContext";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, socket } = useAuth();

  const fetchFeed = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts/feed`);
      setPosts(res.data.posts || []);
    } catch (err) {
      toast.error("Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();

    if (socket) {
      socket.on("newPost", (newPost) => {
        if (newPost.user._id !== user?._id) {
          setPosts(prev => [newPost, ...prev]);
        }
      });

      socket.on("likeUpdate", ({ postId, likes }) => {
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes } : p));
      });

      socket.on("newComment", ({ postId, comment }) => {
        setPosts(prev => prev.map(p => 
          p._id === postId ? { ...p, comments: [...p.comments, comment] } : p
        ));
      });

      return () => {
        socket.off("newPost");
        socket.off("likeUpdate");
        socket.off("newComment");
      };
    }
  }, [socket, user]);

  const handleNewPost = (post) => {
    setPosts(prev => [post, ...prev]);
    socket?.emit("newPost", post);
    setShowCreateModal(false);
    toast.success("Posted! 🚀");
  };

  if (loading) return <div className="text-center py-20">Loading feed...</div>;

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <button
        onClick={() => setShowCreateModal(true)}
        className="w-full mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition"
      >
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex-center text-white font-bold text-2xl">
            +
          </div>
          <p className="text-gray-500">What's on your mind?</p>
        </div>
      </button>

      {posts.length === 0 ? (
        <p className="text-center py-20 text-gray-500">No posts yet. Be the first!</p>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleNewPost}
      />
    </div>
  );
}