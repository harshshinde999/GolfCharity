import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function SelectCharity() {
  const navigate = useNavigate();

  const [charities, setCharities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [percentage, setPercentage] = useState(10);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    const { data, error } = await supabase.from("charities").select("*");

    if (error) {
      console.error(error);
      return;
    }

    setCharities(data);
  };

  const handleSubmit = async () => {
    if (!selected) {
      alert("Please select a charity");
      return;
    }

    if (percentage < 10) {
      alert("Minimum 10%");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // ✅ FIXED: upsert instead of insert
    const { error } = await supabase.from("user_charity").upsert({
      user_id: user.id,
      charity_id: selected,
      percentage: percentage,
    });

    if (error) {
      console.error(error);
      alert("Error saving charity");
      return;
    }

    alert("Charity selected!");
    navigate("/dashboard");
  };

  return (
  <div className="min-h-full bg-linear-to-b from-gray-800 to-gray-200 flex justify-center p-8">

    <div className="w-full max-w-5xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">
          Select a Charity
        </h1>
        <p className="text-sm text-white mt-1">
          Choose a cause to support
        </p>
      </div>

      {/* Charity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

        {charities.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`group relative p-5 rounded-lg border cursor-pointer transition-all duration-200
              ${
                selected === c.id
                  ? "border-indigo-600 bg-white shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm"
              }
            `}
          >
            {/* Accent Indicator */}
            {selected === c.id && (
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-600"></div>
            )}

            <h2 className="text-sm font-semibold text-gray-900">
              {c.name}
            </h2>

            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              {c.description}
            </p>
          </div>
        ))}
      </div>

      {/* Contribution Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <p className="text-sm font-medium text-gray-800">
              Contribution Percentage
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Minimum 10%
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm 
              bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600">%</span>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">

        <p className="text-sm text-gray-500">
          {selected ? "1 charity selected" : "No charity selected"}
        </p>

        <button
          onClick={handleSubmit}
          disabled={!selected}
          className={`px-6 py-2 text-sm rounded-md transition-all duration-200
            ${
              selected
                ? "bg-gray-800 text-white hover:bg-indigo-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          Continue
        </button>
      </div>

    </div>
  </div>
);
}