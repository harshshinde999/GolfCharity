import { supabase } from "../lib/supabase";

export const checkSubscription = async () => {
  try {
    // 🔥 1. Get user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { active: false };
    }

    // 🔥 2. Get subscription
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("❌ Subscription fetch error:", error.message);
      return { active: false };
    }

    if (!data) {
      return { active: false };
    }

    // 🔥 3. Check status
    if (data.status !== "active") {
      return { active: false };
    }

    // 🔥 4. Validate end date
    if (!data.end_date) {
      return { active: false };
    }

    const now = new Date();
    const end = new Date(data.end_date);

    if (isNaN(end.getTime())) {
      return { active: false };
    }

    // 🔥 5. Expiry check
    if (now > end) {
      return { active: false };
    }

    // ✅ ACTIVE
    return {
      active: true,
      plan: data.plan,
      end_date: data.end_date,
    };

  } catch (err) {
    console.error("🔥 Unexpected error:", err.message);
    return { active: false };
  }
};