import { Home, MessageCircle, User, LogOut, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { icon: Home, label: "Home", to: "/dashboard" },
    { icon: MessageCircle, label: "Chats", to: "/dashboard/chats" },
    { icon: User, label: "Profile", to: "/dashboard/profile" },
  ];

  return (
    <div className="h-full flex flex-col justify-between py-6">
      <div className="px-6">
        <div className="flex items-center gap-3 mb-10">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            SocialX
          </h1>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-purple-50 dark:hover:bg-gray-700 transition group"
            >
              <item.icon className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-purple-600" />
              <span className="text-lg font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="px-6 border-t border-gray-200 dark:border-gray-700 pt-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition w-full"
        >
          <LogOut className="w-6 h-6 text-red-600" />
          <span className="text-lg font-medium text-red-600">Logout</span>
        </button>
      </div>
    </div>
  );
}