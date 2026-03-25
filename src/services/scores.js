import { supabase } from "./supabase";

// GET SCORES
export const getScores = async (userId) => {
  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data, error };
};

// ADD SCORE (WITH LIMIT 5)
export const addScore = async (userId, score, date) => {
  // Get existing scores
  const { data: existing } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  // If already 5 → delete oldest
  if (existing.length >= 5) {
    const oldest = existing[0];

    await supabase
      .from("scores")
      .delete()
      .eq("id", oldest.id);
  }

  // Insert new score
  const { data, error } = await supabase.from("scores").insert([
    {
      user_id: userId,
      score,
      date,
    },
  ]);

  return { data, error };
};