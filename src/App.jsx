import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import SelectCharity from "./pages/SelectCharity";
import Scores from "./pages/Scores";
import Subscribe from "./pages/Subscribe";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";

function AppContent() {
  const navigate = useNavigate();

  // 🔥 LOGOUT FUNCTION (GLOBAL)
  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
      return;
    }

    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* 🔥 PASS LOGOUT HERE */}
      <Navbar logout={logout} />

      <Routes>
  <Route path="/" element={<Navigate to="/login" />} />

  {/* PUBLIC */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* PROTECTED */}
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />

  <Route
    path="/select-charity"
    element={
      <ProtectedRoute>
        <SelectCharity />
      </ProtectedRoute>
    }
  />

  <Route
    path="/scores"
    element={
      <ProtectedRoute>
        <Scores />
      </ProtectedRoute>
    }
  />

  <Route
    path="/subscribe"
    element={
      <ProtectedRoute>
        <Subscribe />
      </ProtectedRoute>
    }
  />

  <Route
    path="/admin"
    element={
      <ProtectedRoute>
        <Admin />
      </ProtectedRoute>
    }
  />

  {/* 🔥 THIS MUST BE INSIDE */}
  <Route path="*" element={<Navigate to="/login" replace />} />
</Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}