import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [socket, setSocket] = useState(null); // ← Now in state!
  const navigate = useNavigate();

  // ────────────────────── Dark Mode ──────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setDarkMode(saved);
    if (saved) document.documentElement.classList.add("dark");
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    document.documentElement.classList.toggle("dark");
  };

  // ────────────────────── Set JWT Token ──────────────────────
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  };

  // ────────────────────── Login ──────────────────────
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      });
      const { token, user: loggedUser } = res.data;

      setAuthToken(token);
      setUser(loggedUser);
      toast.success(`Welcome back, ${loggedUser.name}!`);
      navigate("/dashboard");
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // ────────────────────── Register ──────────────────────
  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        name,
        email,
        password,
      });
      const { token, user: newUser } = res.data;

      setAuthToken(token);
      setUser(newUser);
      toast.success("Account created! Welcome");
      navigate("/dashboard");
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // ────────────────────── Logout ──────────────────────
  const logout = () => {
    setUser(null);
    setAuthToken(null);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    toast.success("Logged out");
    navigate("/");
  };

  // ────────────────────── Get Current User ──────────────────────
  const getCurrentUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    setAuthToken(token);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`);
      setUser(res.data.user);
    } catch (err) {
      console.error("Invalid token");
      logout();
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────── SOCKET.IO CONNECTION (FIXED!) ──────────────────────
  useEffect(() => {
    if (user && !socket) {
      const newSocket = io("http://localhost:5000", {
        auth: {
          token: localStorage.getItem("token"),
        },
        transports: ["websocket"],
      });

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection failed:", err.message);
      });

      setSocket(newSocket);

      // Cleanup on unmount or logout
      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [user]); // ← Runs when user logs in

  // ────────────────────── Initial Load ──────────────────────
  useEffect(() => {
    getCurrentUser();
  }, []);

  const value = {
    user,
    socket,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    darkMode,
    toggleDarkMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};