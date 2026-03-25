import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/dashboard");
  };

  return (
  <div className="h-screen w-screen flex overflow-hidden fixed inset-0">

    {/* LEFT */}
    <div className="hidden md:flex w-1/2 bg-gray-900 text-white flex-col justify-center px-16">
      <h1 className="text-3xl font-semibold mb-4">
        Golf Platform
      </h1>

      <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
        Manage your subscriptions, track winnings, and contribute to charity 
        through a secure and transparent system.
      </p>

      <div className="w-12 h-0.5 bg-gray-700 mt-6"></div>
    </div>

    {/* RIGHT */}
    <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center px-6">

      <div className="w-full max-w-sm">

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Sign in
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Access your account
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm 
            bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm 
            bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full mt-5 py-2 text-sm rounded-md bg-gray-900 text-white 
          hover:bg-black transition"
        >
          Login
        </button>

        <p className="text-sm text-gray-600 mt-5">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-gray-900 font-medium hover:underline"
          >
            Create account
          </Link>
        </p>

      </div>
    </div>

  </div>
);
}