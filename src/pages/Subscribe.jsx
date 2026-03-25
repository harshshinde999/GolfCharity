import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Subscribe() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (plan) => {
    try {
      if (loading) return;
      setLoading(true);

      // 🔥 1. Get user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Please login first");
        return;
      }

      // 🔥 2. Create dates
      const start = new Date();
      const end = new Date();

      if (plan === "monthly") {
        end.setMonth(end.getMonth() + 1);
      } else {
        end.setFullYear(end.getFullYear() + 1);
      }

      // 🔥 3. UPSERT subscription (single row per user)
      const { error } = await supabase
        .from("subscriptions")
        .upsert(
          {
            user_id: user.id,
            plan,
            status: "active",
            start_date: start.toISOString(),
            end_date: end.toISOString(),
          },
          {
            onConflict: "user_id", // must match UNIQUE constraint
          }
        );

      if (error) {
        console.error(error);
        alert("Subscription failed: " + error.message);
        return;
      }

      // ✅ Success
      alert("Subscription activated!");
      navigate("/dashboard");

    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
return (
  <div className="min-h-full bg-linear-to-b from-gray-100 to-gray-200 p-6">

    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-xl font-semibold text-gray-900">
          Subscription
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Choose a plan that fits your needs
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Monthly */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col justify-between 
        hover:shadow-md transition-all duration-200">

          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-2">
              Monthly Plan
            </h2>

            <p className="text-3xl font-semibold text-gray-900">
              ₹99
              <span className="text-sm text-gray-500 ml-1">/month</span>
            </p>

            {/* Divider */}
            <div className="h-px bg-gray-200 my-4"></div>

            <ul className="text-sm text-gray-600 space-y-2">
              <li>Access monthly draws</li>
              <li>Basic participation</li>
              <li>Standard support</li>
            </ul>
          </div>

          <button
            onClick={() => handleSubscribe("monthly")}
            disabled={loading}
            className="mt-6 w-full py-2 text-sm rounded-md border border-gray-300 
            text-gray-800 hover:bg-gray-100 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Choose Plan"}
          </button>
        </div>

        {/* Yearly */}
        <div className="relative bg-white border-2 border-indigo-600 rounded-xl p-6 flex flex-col justify-between 
        shadow-sm">

          {/* Badge */}
          <span className="absolute top-4 right-4 text-xs bg-indigo-600 text-white px-2 py-1 rounded">
            Popular
          </span>

          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-2">
              Yearly Plan
            </h2>

            <p className="text-3xl font-semibold text-gray-900">
              ₹999
              <span className="text-sm text-gray-500 ml-1">/year</span>
            </p>

            {/* Divider */}
            <div className="h-px bg-gray-200 my-4"></div>

            <ul className="text-sm text-gray-600 space-y-2">
              <li>Access all draws</li>
              <li>Higher winning chances</li>
              <li>Priority support</li>
            </ul>
          </div>

          <button
            onClick={() => handleSubscribe("yearly")}
            disabled={loading}
            className="mt-6 w-full py-2 text-sm rounded-md bg-indigo-600 text-white 
            hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Choose Plan"}
          </button>
        </div>

      </div>

      {/* Bottom Note (Demo Feel) */}
      <div className="mt-8 text-center text-xs text-gray-500">
        You can upgrade or cancel your plan anytime.
      </div>

    </div>
  </div>
);
}