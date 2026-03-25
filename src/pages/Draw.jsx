import { useState, useEffect } from "react";
import { generateDraw, getMatchCount } from "../utils/draw";
import { getUser } from "../services/auth";
import { getScores } from "../services/scores";

export default function Draw() {
  const [drawNumbers, setDrawNumbers] = useState([]);
  const [matchCount, setMatchCount] = useState(0);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const load = async () => {
      const user = await getUser();
      const { data } = await getScores(user.id);
      setScores(data || []);
    };

    load();
  }, []);

  const handleDraw = () => {
    const draw = generateDraw();
    setDrawNumbers(draw);

    const matches = getMatchCount(scores, draw);
    setMatchCount(matches);
  };

  return (
    <div className="p-5 text-center">
      <h1 className="text-xl mb-4">Monthly Draw</h1>

      <button
        onClick={handleDraw}
        className="bg-purple-500 text-white px-4 py-2"
      >
        Run Draw
      </button>

      {drawNumbers.length > 0 && (
        <div className="mt-5">
          <h2>Draw Numbers:</h2>
          <p>{drawNumbers.join(", ")}</p>

          <h2 className="mt-3">Matches: {matchCount}</h2>

          {matchCount >= 5 && <p>🎉 Jackpot Winner!</p>}
          {matchCount === 4 && <p>🏆 Great Job!</p>}
          {matchCount === 3 && <p>👍 Small Prize</p>}
          {matchCount < 3 && <p>😢 Try Again</p>}
        </div>
      )}
    </div>
  );
}