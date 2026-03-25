import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Admin() {
  const [winners, setWinners] = useState([]);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);

  // 🔥 Fetch users (NEW)
  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, email");

    setUsers(data || []);
  };

  // 🔥 Fetch winnings
  const fetchWinners = async () => {
    const { data } = await supabase
      .from("winnings")
      .select("*");

    setWinners(data || []);
  };

  // 🔥 Mark as paid
  const markAsPaid = async (id) => {
    const { error } = await supabase
      .from("winnings")
      .update({ status: "paid" })
      .eq("id", id);

    if (!error) {
      fetchWinners();

      await supabase.from("admin_logs").insert([
        {
          action: `Marked winning ${id} as paid`,
          created_at: new Date().toISOString(),
        },
      ]);
    }
  };

  // 🔥 Fetch logs
  const fetchLogs = async () => {
    const { data } = await supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false });

    setLogs(data || []);
  };

  useEffect(() => {
    fetchUsers();   // 🔥 NEW
    fetchWinners();
    fetchLogs();
  }, []);

  // 🔥 STATS CALCULATION (NEW)
  const totalWinnings = winners.reduce((sum, w) => sum + (w.amount || 0), 0);
  const pendingCount = winners.filter((w) => w.status !== "paid").length;

  return (
  <div className="min-h-full bg-linear-to-b from-gray-100 to-gray-200 p-6">

    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Overview of platform activity
        </p>
      </div>

      {/* 🔥 STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Total Users
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-1">
            {users.length}
          </h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Total Winnings
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-1 font-stretch-ultra-condensed">
            ₹ {totalWinnings}
          </h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Pending Payments
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-1">
            {pendingCount}
          </h2>
        </div>

      </div>

      {/* 👥 USERS */}
      <div className="bg-white border border-gray-200 rounded-xl mb-6 shadow-sm">

        <div className="px-5 py-3 border-b text-sm+1 font-semibold text-gray-700">
          Users
        </div>

        {users.length > 0 ? (
          users.map((u, index) => (
            <div
              key={u.id}
              className={`px-5 py-3 text-sm ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              {u.email}
            </div>
          ))
        ) : (
          <p className="p-5 text-sm text-gray-400">
            No users found
          </p>
        )}
      </div>

      {/* 💰 WINNINGS */}
      <div className="bg-white border border-gray-200 rounded-xl mb-6 shadow-sm">

        <div className="px-5 py-3 border-b text-sm+1 font-semibold text-gray-700">
          Winnings
        </div>

        {winners.length > 0 ? (
          winners.map((w, index) => (
            <div
              key={w.id}
              className={`flex justify-between items-center px-5 py-4 text-sm ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <div>
                <p className="text-gray-800 ">
                  User: {w.user_id}
                </p>

                <p className="text-gray-600">
                  Amount:{" "}
                  <span className="font-semibold text-gray-900">
                    ₹{w.amount}
                  </span>
                </p>

                <p className="text-gray-600">
                  Status:{" "}
                  <span
                    className={
                      w.status === "paid"
                        ? "text-gray-700"
                        : "text-indigo-600"
                    }
                  >
                    {w.status}
                  </span>
                </p>
              </div>

              {w.status !== "paid" && (
                <button
                  onClick={() => markAsPaid(w.id)}
                  className="px-3 py-1 text-sm bg-gray-900 text-white rounded-md 
                  hover:bg-black transition"
                >
                  Mark Paid
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="p-5 text-sm text-gray-400">
            No winnings found
          </p>
        )}
      </div>

      {/* 📜 LOGS */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">

        <div className="px-5 py-3 border-b text-sm+1 font-semibold text-gray-700">
          Admin Logs
        </div>

        {logs.length > 0 ? (
          logs.map((log, index) => (
            <div
              key={log.id}
              className={`px-5 py-3 text-sm ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <span className="text-gray-800">
                {log.action}
              </span>
              <span className="text-gray-400 ml-2">
                — {new Date(log.created_at).toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <p className="p-5 text-sm text-gray-400">
            No logs yet
          </p>
        )}
      </div>

    </div>
  </div>
);
}   