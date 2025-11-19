// frontend/src/pages/dashboard/Dashboard.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import MobileNav from "./components/MobileNav";
import Topbar from "./components/Topbar";
import CreatePost from "./components/CreatePost";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Topbar - Always visible */}
      <Topbar />

      <div className="flex pt-16"> {/* pt-16 = Topbar height */}
        {/* Desktop Sidebar */}
        <div className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-64"> {/* Offset for sidebar */}
          <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Create Post Box */}
            <CreatePost />

            {/* Nested Routes Outlet (Home/Chats/Profile) */}
            <div className="mt-8">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  );
}