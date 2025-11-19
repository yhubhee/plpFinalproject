import { useEffect, useState, useRef } from "react";
import { Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

export default function Chats() {
  const { user: currentUser, socket } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users");
        setAllUsers(res.data.users.filter(u => u._id !== currentUser._id));
      } catch (err) {
        console.error("Failed to load users:", err);
        toast.error("Failed to load users");
      }
    };
    if (currentUser) fetchUsers();
  }, [currentUser]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("userOnline", (userId) => {
      setOnlineUserIds(prev => new Set(prev).add(userId));
    });

    socket.on("userOffline", (userId) => {
      setOnlineUserIds(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socket.on("newMessage", (message) => {
      if (
        selectedUser &&
        (message.from === selectedUser._id || message.to === selectedUser._id)
      ) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => {
      socket.off("userOnline");
      socket.off("userOffline");
      socket.off("newMessage");
    };
  }, [socket, selectedUser]);

  const openChat = (user) => {
    setSelectedUser(user);
    setMessages([]);
  };

const sendMessage = () => {
  if (!newMessage.trim() || !selectedUser || !socket) return;

  socket.emit("sendMessage", {
    to: selectedUser._id,
    text: newMessage.trim(),
  });

  setNewMessage("");
};

// Inside the useEffect with socket listeners — replace the newMessage listener
socket.on("newMessage", (message) => {
  // Don't show our own message twice
  if (message.from === currentUser._id) return;

  if (selectedUser && message.from === selectedUser._id) {
    setMessages(prev => [...prev, message]);
  }
});

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Users List */}
      <div className="w-full md:w-96 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
        <div className="p-5 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {allUsers.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">No users found</p>
          ) : (
            allUsers.map(u => (
              <div
                key={u._id}
                onClick={() => openChat(u)}
                className={`p-4 flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition ${
                  selectedUser?._id === u._id ? "bg-purple-100 dark:bg-purple-900" : ""
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                    {u.name[0].toUpperCase()}
                  </div>
                  {onlineUserIds.has(u._id) && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-3 border-white"></div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-lg">{u.name}</p>
                  <p className="text-sm text-gray-500">
                    {onlineUserIds.has(u._id) ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                {selectedUser.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-lg">{selectedUser.name}</p>
                <p className="text-sm text-green-600">
                  {onlineUserIds.has(selectedUser._id) ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
              {messages.length === 0 ? (
                <p className="text-center text-gray-500 mt-20">
                  Say hello to {selectedUser.name}!
                </p>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.from === currentUser._id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-5 py-3 rounded-3xl shadow-md ${
                        msg.from === currentUser._id
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <p className="text-base">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-5 py-3 rounded-full bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <button
                  onClick={sendMessage}
                  className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:opacity-90 transition"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex-center text-gray-500 text-2xl">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}