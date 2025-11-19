import { Sun, Moon, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar({ mobileMenuOpen, setMobileMenuOpen, toggleDarkMode, darkMode, openLogin, openRegister }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          SocialX
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={openLogin} className="hover:text-purple-600 transition">Login</button>
          <button onClick={openRegister} className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition">
            Sign Up
          </button>
          <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col p-6 gap-4">
            <button onClick={openLogin} className="text-left text-lg">Login</button>
            <button onClick={openRegister} className="text-left text-lg font-semibold text-purple-600">Sign Up</button>
            <button onClick={toggleDarkMode} className="flex items-center gap-3">
              {darkMode ? <Sun /> : <Moon />} {darkMode ? "Light" : "Dark"} Mode
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}