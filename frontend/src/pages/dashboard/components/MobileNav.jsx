import { Home, MessageCircle, User, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function MobileNav() {
  const navItems = [
    { icon: Home, to: "/dashboard" },
    { icon: MessageCircle, to: "/dashboard/chats" },
    { icon: Sparkles, to: "/dashboard" },
    { icon: User, to: "/dashboard/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-around py-3">
        {navItems.map((item, i) => (
          <NavLink
            key={i}
            to={item.to}
            className={({ isActive }) =>
              `p-3 rounded-xl transition ${isActive ? "text-purple-600" : "text-gray-600 dark:text-gray-400"}`
            }
          >
            <item.icon className="w-6 h-6" />
          </NavLink>
        ))}
      </div>
    </div>
  );
}