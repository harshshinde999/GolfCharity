import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Better auth check (instead of localStorage)
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        navigate("/dashboard");
      }
    };

    checkUser();
  }, []);

  const handleRegister = async () => {
  if (loading) return;
  setLoading(true);

  const cleanEmail = email.trim();

  if (!cleanEmail || !password) {
    alert("Fill all fields");
    setLoading(false);
    return;
  }

  // 🔥 1. Create user
  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
  });

  if (error) {
    alert(error.message);
    setLoading(false);
    return;
  }

  const user = data?.user;

  if (!user) {
    alert("Signup failed");
    setLoading(false);
    return;
  }

  // 🔥 2. Insert profile (SAFE)
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email: user.email,
    });

  if (profileError) {
    console.error(profileError);
    alert("Profile creation failed");
    setLoading(false);
    return;
  }

  alert("Registration successful!");
  setLoading(false);

  navigate("/login");
};
return (
  <div className="h-screen w-screen flex overflow-hidden fixed inset-0">

    {/* 🔥 LEFT SIDE (Brand Panel) */}
    <div className="hidden md:flex w-1/2 bg-gray-900 text-white flex-col justify-center px-16">

      <h1 className="text-3xl font-semibold mb-4">
        Golf Platform
      </h1>

      <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
        Create your account to start participating in draws, track your winnings, 
        and contribute to meaningful charity programs.
      </p>

      <div className="w-12 h-0.5 bg-gray-700 mt-6"></div>
    </div>


    {/* 🔥 RIGHT SIDE (Register Panel) */}
    <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center px-6">

      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Create Account
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Get started with your account
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm 
            bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm 
            bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full mt-5 py-2 text-sm rounded-md bg-gray-900 text-white 
          hover:bg-black transition disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Login Link */}
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-gray-900 font-medium cursor-pointer hover:underline"
          >
            Login in
          </span>
        </p>

      </div>
    </div>

  </div>
);
}