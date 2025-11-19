import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/dashboard/Home";
import Chats from "./pages/dashboard/Chats";
import Profile from "./pages/dashboard/Profile";

function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />        {/* ← MUST BE HERE */}
      <Route path="/register" element={<Register />} />  {/* ← MUST BE HERE */}

      {/* PROTECTED DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="chats" element={<Chats />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/:id" element={<Profile />} />
      </Route>

      {/* CATCH ALL */}
      <Route path="*" element={<div className="text-center py-20 text-4xl">404 - Page Not Found</div>} />
    </Routes>
  );
}

export default App;