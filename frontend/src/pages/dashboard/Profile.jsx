// frontend/src/pages/dashboard/Profile.jsx  ← REPLACE YOUR FILE WITH THIS
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import PostCard from "../../components/PostCard";   // ← FIXED PATH
import { Edit2, Camera } from "lucide-react";

export default function Profile() {
  const { id } = useParams();                    // For /profile/:id
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");

  const isOwnProfile = !id || currentUser?._id === id;

  const fetchProfile = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      const userId = id || currentUser._id;

      // TEMP FIX: Since we don't have these APIs yet, use currentUser for own profile
      if (isOwnProfile) {
        setProfileUser(currentUser);
        setBio(currentUser.bio || "");
        
        // Fetch own posts (temporary until we have /posts/user/:id)
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts/feed`);
        const myPosts = res.data.posts.filter(p => p.user._id === currentUser._id);
        setPosts(myPosts);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id, currentUser]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/upload/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProfileUser(prev => ({ ...prev, avatar: res.data.avatar }));
      toast.success("Avatar updated! 🎉");
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  const saveBio = async () => {
    try {
      // Temporary - we'll add this API later
      toast.success("Bio saved locally!");
      setProfileUser(prev => ({ ...prev, bio }));
      setEditing(false);
    } catch (err) {
      toast.error("Failed to update bio");
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-2xl">Loading profile...</div>;
  }

  if (!profileUser) {
    return <div className="text-center py-20 text-red-500">Profile not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <img
              src={profileUser.avatar 
                ? `http://localhost:5000${profileUser.avatar}` 
                : "https://via.placeholder.com/150?text=Avatar"
              }
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-purple-600 shadow-lg"
            />
            {isOwnProfile && (
              <label className="absolute bottom-0 right-0 bg-purple-600 p-3 rounded-full cursor-pointer hover:bg-purple-700 transition shadow-lg">
                <Camera className="w-5 h-5 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {profileUser.name}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
              @{profileUser.email.split("@")[0]}
            </p>

            {editing ? (
              <div className="mt-6">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-4 rounded-xl border dark:bg-gray-700 focus:ring-2 focus:ring-purple-600"
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
                <div className="flex gap-3 mt-4">
                  <button onClick={saveBio} className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition">
                    Save Bio
                  </button>
                  <button 
                    onClick={() => {
                      setEditing(false);
                      setBio(profileUser.bio || "");
                    }} 
                    className="px-6 py-3 bg-gray-300 dark:bg-gray-700 rounded-full hover:opacity-80 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {profileUser.bio || "No bio yet. Click Edit Profile to add one!"}
              </p>
            )}

            <div className="flex gap-10 mt-8 justify-center md:justify-start">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{posts.length}</p>
                <p className="text-gray-600">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">0</p>
                <p className="text-gray-600">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">0</p>
                <p className="text-gray-600">Following</p>
              </div>
            </div>

            {isOwnProfile && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="mt-8 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold hover:opacity-90 transition shadow-lg flex items-center gap-2 mx-auto md:mx-0"
              >
                <Edit2 className="w-5 h-5" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User's Posts */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-8 text-center md:text-left">Your Posts</h2>
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <p className="text-2xl text-gray-500">No posts yet</p>
            <p className="text-lg mt-4">Start sharing your thoughts with the world! 🚀</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
              <div key={post._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                {post.image && (
                  <img src={`http://localhost:5000${post.image}`} alt="post" className="w-full h-64 object-cover" />
                )}
                <div className="p-6">
                  <p className="text-lg line-clamp-3">{post.text || "No caption"}</p>
                  <p className="text-sm text-gray-500 mt-4">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}