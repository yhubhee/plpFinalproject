import { useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function CreatePostModal({ isOpen, onClose, onSuccess }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, socket } = useAuth();

  if (!isOpen) return null;

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const submit = async () => {
    if (!text.trim() && !image) return toast.error("Can't post nothing!");

    setLoading(true);
    const form = new FormData();
    form.append("text", text);
    if (image) form.append("image", image);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/posts`, form);
      onSuccess(res.data.post);
      toast.success("Posted! 🔥");
      setText("");
      setImage(null);
      setPreview(null);
    } catch (err) {
      toast.error("Post failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create Post</h2>
          <button onClick={onClose}><X className="w-6 h-6" /></button>
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="What's happening?"
          className="w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-purple-600 outline-none"
          rows="5"
        />

        {preview && (
          <div className="my-4 relative">
            <img src={preview} className="rounded-xl max-h-96 w-full object-cover" />
            <button
              onClick={() => { setImage(null); setPreview(null); }}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
            >×</button>
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <label className="cursor-pointer flex items-center gap-2 text-purple-600">
            <ImageIcon className="w-6 h-6" />
            <span>Photo</span>
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>

          <button
            onClick={submit}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold disabled:opacity-70"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}