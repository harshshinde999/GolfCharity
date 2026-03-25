import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Scores() {
  const [scores, setScores] = useState([]);
  const [newScore, setNewScore] = useState("");
  const [date, setDate] = useState("");
  const [loadingPage, setLoadingPage] = useState(true);

  // 🔐 Check subscription (FIXED)
  const checkSubscription = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return false;
      }

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (error) {
        console.error("Subscription error:", error.message);
        return false;
      }

      if (!data) {
        alert("You need an active subscription");
        window.location.href = "/subscribe";
        return false;
      }

      // 🔥 expiry check
      const now = new Date();
      const end = new Date(data.end_date);

      if (!data.end_date || isNaN(end.getTime()) || now > end) {
        alert("Subscription expired");
        window.location.href = "/subscribe";
        return false;
      }

      return true;

    } catch (err) {
      console.error("Unexpected error:", err);
      return false;
    }
  };

  // 📊 Fetch scores
  const fetchScores = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("scores")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      setScores(data || []);
    } catch (err) {
      console.error("Fetch scores error:", err);
    }
  };

  // 🚀 INIT
  useEffect(() => {
    const init = async () => {
      const isValid = await checkSubscription();

      if (!isValid) {
        setLoadingPage(false);
        return;
      }

      await fetchScores();
      setLoadingPage(false);
    };

    init();
  }, []);

  // ➕ Add score
  const handleAddScore = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("User not logged in");
        return;
      }

      if (!newScore || !date) {
        alert("Enter score and date");
        return;
      }

      if (newScore < 1 || newScore > 45) {
        alert("Score must be between 1–45");
        return;
      }

      // 🔥 get existing scores
      const { data: existing } = await supabase
        .from("scores")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      // 🔥 keep max 5 scores
      if (existing && existing.length >= 5) {
        const oldest = existing[0];
        await supabase.from("scores").delete().eq("id", oldest.id);
      }

      // 🔥 insert new score
      const { error } = await supabase.from("scores").insert([
        {
          user_id: user.id,
          score: Number(newScore),
          date,
        },
      ]);

      if (error) {
        console.error("Insert error:", error.message);
        alert(error.message);
        return;
      }

      setNewScore("");
      setDate("");
      fetchScores();

    } catch (err) {
      console.error("Add score error:", err);
    }
  };

  // ⏳ Loading
  if (loadingPage) {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">

      {/* Spinner */}
      <div className="w-10 h-10 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>

      {/* Text */}
      <p className="mt-4 text-sm text-gray-500 tracking-wide">
        Loading...
      </p>
    </div>
  );
}
  return (
  <div className="min-h-full bg-gray-200 p-5">

    {/* Header */}
    <div className="mb-5">
      <h1 className="text-lg pl-3 font-semibold text-gray-900">
        Scores
      </h1>
      <p className="text-sm pl-3 text-gray-600">
        Add and manage your scores
      </p>
    </div>

    {/* Section Background (mid grey block) */}
    <div className="bg-gray-200/60 rounded-lg p-5 mb-5">

      {/* Add Score Card */}
      <div className="bg-white border border-gray-200 rounded-md p-5">

        <h2 className="text-sm font-semibold text-gray-800 mb-4">
          Add Score
        </h2>

        <div className="flex flex-col md:flex-row gap-3">

          <input
            type="number"
            placeholder="Score (1-45)"
            value={newScore}
            onChange={(e) => setNewScore(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm 
            bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm 
            bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
          />

          <button
            onClick={handleAddScore}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md 
            hover:bg-black transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>

    {/* Table Section */}
    <div className="bg-gray-200/60 rounded-lg p-5">

      <div className="bg-white border border-gray-200 rounded-md">

        {/* Header */}
        <div className="grid grid-cols-2 px-4 py-3 border-b text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <span>Score</span>
          <span>Date</span>
        </div>

        {/* Rows */}
        {scores.length > 0 ? (
          scores.map((s, index) => (
            <div
              key={s.id}
              className={`grid grid-cols-2 px-4 py-3 text-sm ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <span className="text-gray-900 font-medium">
                {s.score}
              </span>
              <span className="text-gray-600">
                {s.date}
              </span>
            </div>
          ))
        ) : (
          <p className="p-4 text-sm text-gray-400">
            No scores added yet
          </p>
        )}
      </div>
    </div>

  </div>
);
}