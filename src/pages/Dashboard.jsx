import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { runDraw } from "../api/draw";
import { Menu, X, LogOut } from "lucide-react";

import UploadProof from "../components/UploadProof";

export default function Dashboard() {
  const navigate = useNavigate();

  const [charity, setCharity] = useState(null);
  const [drawResult, setDrawResult] = useState(null);
  const [userResult, setUserResult] = useState(null);
  const [winnings, setWinnings] = useState([]);
  const [loadingDraw, setLoadingDraw] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔐 Check subscription
  const checkSubscription = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        navigate("/login");
        return false;
      }

      const { data, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (subError) {
        console.error("Subscription error:", subError.message);
        return false;
      }

      if (!data) {
        navigate("/subscribe");
        return false;
      }

      const now = new Date();
      const end = new Date(data.end_date);

      if (!data.end_date || isNaN(end.getTime()) || now > end) {
        navigate("/subscribe");
        return false;
      }

      return true;
    } catch (err) {
      console.error("Unexpected error:", err);
      return false;
    }
  };

  // 🎗 Check charity
  const checkCharity = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("user_charity")
      .select("*, charities(*)")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!data) {
      navigate("/select-charity");
      return false; // 🔥 IMPORTANT
    }

    setCharity(data);
    return true; // 🔥 IMPORTANT
  } catch (err) {
    console.error("Charity error:", err);
    return false;
  }
};

  // 🎲 Fetch latest draw
  const fetchLatestDraw = async () => {
    try {
      const { data } = await supabase
        .from("draws")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setDrawResult(data);
    } catch (err) {
      console.error("Draw error:", err);
    }
  };

  // 🧠 Fetch user result
  const fetchUserResult = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: latestDraw } = await supabase
        .from("draws")
        .select("id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latestDraw) return;

      const { data } = await supabase
        .from("draw_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("draw_id", latestDraw.id)
        .maybeSingle();

      setUserResult(data);
    } catch (err) {
      console.error("User result error:", err);
    }
  };

  // 💰 Fetch winnings
  const fetchWinnings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("winnings")
        .select("*")
        .eq("user_id", user.id)

      if (error) {
        console.error("Winnings error:", error.message);
        return;
      }

      setWinnings(data || []);
    } catch (err) {
      console.error("Winnings error:", err);
    }
  };

  // 🚀 INIT
useEffect(() => {
  const init = async () => {
    try {
      const isSubscribed = await checkSubscription();

      if (!isSubscribed) {
        setLoadingPage(false);
        return;
      }

      // ✅ FIX: properly get charity result
      const hasCharity = await checkCharity();

      if (!hasCharity) {
        setLoadingPage(false);
        return;
      }
     

      // ✅ Continue only if valid
      await fetchLatestDraw();
      await fetchUserResult();
      await fetchWinnings();

    } catch (error) {
      console.error("Init error:", error);
    } finally {
      setLoadingPage(false);
    }
  };

  init();
}, []);


// 🎲 Run draw
const handleRunDraw = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // 🔥 CHECK SCORES FIRST
  const { data: scores } = await supabase
    .from("scores")
    .select("id")
    .eq("user_id", user.id);

  if (!scores || scores.length === 0) {
    const confirmGo = window.confirm(
      "⚠️ You have not added any scores.\n\nPlease add scores first.\n\nGo to Scores page?"
    );

    if (confirmGo) {
      navigate("/scores");
    }

    return; // ⛔ stop draw
  }

  // ✅ YOUR ORIGINAL LOGIC (UNCHANGED)
  if (loadingDraw) return;
  setLoadingDraw(true);

  try {
    await runDraw();

    await fetchLatestDraw();
    await fetchUserResult();
    await fetchWinnings();

    
  } catch (err) {
    console.error(err);
    alert("Error running draw");
  } finally {
    setLoadingDraw(false);
  }
};


// 🚪 Logout
const logout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error.message);
    return;
  }

  // ✅ Proper React navigation
  navigate("/login", { replace: true });
};

// ⏳ Loading
if (loadingPage) {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">

      {/* Spinner */}
      <div className="w-10 h-10 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>

      {/* Text */}
      <p className="mt-4 text-sm text-gray-500">
        Loading dashboard...
      </p>
    </div>
  );
}

  return (
  <div className="flex h-screen overflow-hidden bg-[#f5f6f8]">

    {/* 🔥 SIDEBAR */}
    <aside
      className={`fixed z-40 top-0 left-0 h-screen w-64 bg-[#0f172a] text-gray-300 flex flex-col transform 
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
      transition-transform duration-300 
      md:translate-x-0`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex pl-4 items-center gap-3 pb-3">
          <div className="w-7 h-7  rounded-full bg-gray-600"></div>
          <h1 className="font-bold text-white text-3xl ">Golf</h1>
        </div>

        <button
          className="md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-2 text-sm+1 font-semibold">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full text-left px-4 py-2 rounded-md bg-gray-800 text-white"
        >
          Dashboard
        </button>

        <button
          onClick={() => navigate("/scores")}
          className="w-full text-left px-4 py-2  rounded-md hover:bg-gray-800 hover:text-white"
        >
          Scores
        </button>

        <button
          onClick={() => navigate("/subscribe")}
          className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-800 hover:text-white"
        >
          Subscription
        </button>

        <button
          onClick={() => navigate("/admin")}
          className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-800 hover:text-white"
        >
          Admin
        </button>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-500 rounded-md"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>

    {/* 🔥 OVERLAY (Mobile only) */}
    {sidebarOpen && (
      <div
        className="fixed inset-0 bg-black/40 z-30 md:hidden"
        onClick={() => setSidebarOpen(false)}
      />
    )}

    {/* 🔥 MAIN CONTENT */}
    <div className="flex-1 flex flex-col h-screen overflow-hidden w-full md:pl-64">

      {/* 🔥 TOPBAR */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-4 md:px-6">

        {/* Mobile Menu */}
        <button
          className="md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu />
        </button>

        <h1 className="text-sm+1.5 font-semibold text-gray-700">
          DASHBOARD
        </h1>

        <button
          onClick={handleRunDraw}
          disabled={loadingDraw}
          className="
            px-4 md:px-5 py-2 
            text-sm font-semibold 
            bg-linear-to-r from-gray-900 to-black 
            text-white rounded-lg 
            shadow-md
            transition-all duration-200 ease-in-out

            hover:from-black hover:to-gray-800 
            hover:shadow-lg hover:scale-[1.03]

            active:scale-95 
            cursor-pointer

            disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
          "
        >
          {loadingDraw ? "Processing..." : "Run Draw"}
        </button>
      </header>

      {/* 🔥 CONTENT */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-4 w-full">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">

          <div className="bg-white border p-4 md:p-5 rounded-md">
            <p className="text-xs text-gray-500 uppercase">
              Available Funds
            </p>
            <h2 className="text-lg md:text-xl font-semibold mt-1">
              ₹20,426.60
            </h2>
          </div>

          <div className="bg-white border p-4 md:p-5 rounded-md">
            <p className="text-xs text-gray-500 uppercase">
              Matches
            </p>
            <h2 className="text-lg md:text-xl font-semibold mt-1">
              {userResult?.matched_count || 0}
            </h2>
          </div>

          <div className="bg-white border p-4 md:p-5 rounded-md">
            <p className="text-xs text-gray-500 uppercase">
              Winnings
            </p>
            <h2 className="text-lg md:text-xl font-semibold mt-1">
              ₹{winnings.reduce((a, b) => a + b.amount, 0)}
            </h2>
          </div>
        </div>

        {/* Charity */}
        <div className="bg-white border p-4 md:p-5 rounded-md mb-6">
          <h2 className="text-sm font-bold mb-3">Charity</h2>

          {charity ? (
            <>
              <p className="text-sm text-gray-800">
                {charity.charities?.name}
              </p>
              <p className="text-sm text-gray-500">
                {charity.percentage}%
              </p>
            </>
          ) : (
            <p className="text-gray-400 text-sm">Not selected</p>
          )}
        </div>

        {/* Winnings */}
        <div className="bg-white border rounded-md">
          <div className="px-4 py-3 border-b text-xs font-bold uppercase">
            Winnings
          </div>

          {winnings.length > 0 ? (
            winnings.map((w) => (
              <div
                key={w.id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-4 py-3 border-b text-sm"
              >
                <div>
                  <p className="text-gray-900 font-medium">
                    ₹{w.amount}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {w.status}
                  </p>
                </div>

                <div>
                  {!w.proof_url ? (
                    <UploadProof winningId={w.id} />
                  ) : (
                    <a
                      href={w.proof_url}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        inline-flex items-center justify-center
                        px-3 py-1.5 
                        text-xs md:text-sm font-medium
                        text-blue-600 border border-blue-600 
                        rounded-md

                        transition-all duration-200

                        hover:bg-blue-600 hover:text-white
                        hover:shadow-md hover:scale-[1.05]

                        active:scale-95
                        cursor-pointer
                      "
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="p-4 text-gray-400 text-sm">
              No records
            </p>
          )}
        </div>

      </main>
    </div>
  </div>
);

}