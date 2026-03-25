import { supabase } from "../lib/supabase";
import { generateDrawNumbers, getMatchCount } from "../utils/draw";

export const runDraw = async () => {
  try {
    

    const drawNumbers = generateDrawNumbers();
    const now = new Date();
    const month = now.toISOString().slice(0, 7);

    // 🔥 1. Create draw
    const { data: drawData, error: drawError } = await supabase
      .from("draws")
      .insert([
        {
          month,
          numbers: drawNumbers,
          status: "published",
          created_at: now.toISOString(),
        },
      ])
      .select()
      .single();

    if (drawError) {
      console.error(drawError);
      return;
    }

    const drawId = drawData.id;

    // 🔥 2. Get active users
    const { data: users } = await supabase
      .from("subscriptions")
      .select("user_id, end_date")
      .eq("status", "active");

    if (!users || users.length === 0) return;

    const validUsers = [];
    const matchResults = [];

    // 🔥 3. Process users
    for (const u of users) {
      const endDate = new Date(u.end_date);
      if (!u.end_date || endDate < now) continue;

      const { data: scores } = await supabase
        .from("scores")
        .select("score")
        .eq("user_id", u.user_id);

      if (!scores || scores.length === 0) continue;

      const userScores = scores.map((s) => Number(s.score));
      const matchCount = getMatchCount(userScores, drawNumbers);

      matchResults.push({
        user_id: u.user_id,
        matchCount,
      });

      validUsers.push(u.user_id);

      // store entry
      await supabase.from("draw_entries").insert([
        {
          user_id: u.user_id,
          draw_id: drawId,
          matched_count: matchCount,
        },
      ]);
    }

    // 🔥 4. PRIZE POOL (example)
    const totalPool = validUsers.length * 100; // ₹100 per user

    const tier5 = matchResults.filter((u) => u.matchCount === 5);
    const tier4 = matchResults.filter((u) => u.matchCount === 4);
    const tier3 = matchResults.filter((u) => u.matchCount === 3);
    const tier2 = matchResults.filter((u) => u.matchCount === 2); // ✅ NEW
  

    const distribute = async (users, percentage) => {
      if (users.length === 0) return;

      const poolShare = (totalPool * percentage) / 100;
      const perUser = poolShare / users.length;

      for (const u of users) {
        await supabase.from("winnings").insert([
          {
            user_id: u.user_id,
            amount: Math.floor(perUser),
            status: "pending",
          },
        ]);
      }
    };

    // 🔥 5. Distribute prizes
    await distribute(tier5, 40); // jackpot
    await distribute(tier4, 35);
    await distribute(tier3, 25);
    await distribute(tier2, 10); // ✅ new


    // 🔥 LOG
    await supabase.from("admin_logs").insert([
      {
        action: "Draw executed with PRD prize distribution",
        created_at: new Date().toISOString(),
      },
    ]);

    

  } catch (err) {
    console.error(err);
  }
};