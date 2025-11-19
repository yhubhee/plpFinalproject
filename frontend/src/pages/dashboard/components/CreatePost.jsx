export default function CreatePost() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xl">
          U
        </div>
        <textarea
          placeholder="What's on your mind?"
          className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl px-6 py-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-600"
          rows="3"
        />
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-4">
          <button className="text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg"> Photo</button>
          <button className="text-pink-600 hover:bg-pink-50 px-4 py-2 rounded-lg"> Gif</button>
        </div>
        <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:opacity-90 transition">
          Post
        </button>
      </div>
    </div>
  );
}