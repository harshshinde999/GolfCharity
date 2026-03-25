import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";

export default function Navbar({ logout }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // 🔥 HIDE NAVBAR ON DASHBOARD
  if (location.pathname === "/dashboard") return null;

  const navLinks = [
    { path: "/dashboard", name: "Dashboard" },
    { path: "/scores", name: "Scores" },
    { path: "/subscribe", name: "Subscription" },
    { path: "/admin", name: "Admin" },
  ];

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 h-14 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 pl-2  rounded-full bg-gray-900"></div>
          <h1 className="text-2xl font-bold text-gray-900">
            Golf
          </h1>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm">

          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition cursor-pointer ${
                location.pathname === link.path
                  ? "text-gray-900 font-medium"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* 🔥 LOGOUT BUTTON */}
          <button
            onClick={logout}
            className="flex items-center justify-center w-9 h-9 
            rounded-md border border-gray-200 
            text-gray-700 cursor-pointer
            hover:border-red-400 hover:text-red-600 hover:bg-red-50 
            transition"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-3">

          <button
            onClick={logout}
            className="flex items-center justify-center w-9 h-9 
            rounded-md border border-gray-200 
            text-gray-700 hover:text-red-600 
            hover:border-red-400 hover:bg-red-50 
            transition"
          >
            <LogOut size={18} />
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-md hover:bg-gray-100 transition"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-3 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setOpen(false)}
              className={`block ${
                location.pathname === link.path
                  ? "text-gray-900 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}