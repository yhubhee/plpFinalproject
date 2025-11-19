import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, FileText, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";   // ← THIS IS THE KEY
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Landing({ toggleDarkMode, darkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-black dark:to-purple-900 text-gray-900 dark:text-white transition-colors">
        <Navbar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          toggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
        />

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 px-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-purple-600/20 blur-3xl"></div>
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Connect. Chat. Secure.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              The next-generation social platform with end-to-end encrypted chats and beautiful feeds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              {/* REGISTER BUTTON */}
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl transition-shadow"
                >
                  Get Started Free
                </motion.button>
              </Link>

              {/* LOGIN BUTTON */}
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-purple-600 text-purple-600 dark:text-purple-400 font-semibold rounded-full hover:bg-purple-600 hover:text-white transition-all"
                >
                  Sign In
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mt-16"
            >
              <Sparkles className="w-16 h-16 mx-auto text-purple-500" />
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Why Choose Us?
            </h2>
            <div className="grid md:grid-cols-3 gap-10">
              {[
                { icon: MessageCircle, title: "Real-time Chat", desc: "Instant messaging with typing indicators & read receipts" },
                { icon: FileText, title: "Beautiful Posts", desc: "Rich media feeds with likes, comments & shares" },
                { icon: Shield, title: "Bank-Level Security", desc: "End-to-end encryption. Your data stays yours." },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 shadow-lg hover:shadow-2xl transition-shadow"
                >
                  <feature.icon className="w-16 h-16 mx-auto mb-6 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}