import React, { useState, useEffect } from "react";

// Interfaces
interface Activity {
  day: number;
  title: string;
  description: string;
  viatorId?: string;
  expediaId?: string;
}

export default function TripPlanner() {
  // States
  const [ai, setAi] = useState<any>(null);
  const [destination, setDestination] = useState("");
  const [itinerary, setItinerary] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFull, setShowFull] = useState(false);

  // Affiliate IDs from environment variables
  const VIATOR_AFFILIATE_ID = import.meta.env.VITE_VIATOR_ID;
  const EXPEDIA_AFFILIATE_ID = import.meta.env.VITE_EXPEDIA_ID;
  const API_KEY = import.meta.env.VITE_API_KEY;

  // Dynamically import GoogleGenAI
  useEffect(() => {
    (async () => {
      const module = await import("@google/genai");
      setAi(new module.GoogleGenAI({ apiKey: API_KEY }));
    })();
  }, []);

  // Generate itinerary
  const generateItinerary = async () => {
    if (!destination || !ai) return;
    setLoading(true);
    try {
      const response = await ai.generate({
        model: "text-bison-001",
        prompt: `Create a gentle-paced 7-day itinerary for ${destination}. Include suggested activities and hotels in JSON format: [{day, title, description, viatorId?, expediaId?}]`,
      });

      const activities: Activity[] = JSON.parse(response.text || "[]");
      setItinerary(activities);
    } catch (err) {
      console.error("AI error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-stone-50 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">Your Trip Planner</h2>

      <input
        type="text"
        placeholder="Enter destination..."
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        className="border p-2 mb-4 w-full rounded"
      />

      <button
        onClick={generateItinerary}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        disabled={loading || !ai}
      >
        {loading ? "Planning your perfect trip..." : "Generate Itinerary"}
      </button>

      <div>
        {itinerary.length === 0 && !loading && <p>Enter a destination and click Generate.</p>}

        {itinerary.map((day) => {
          const isBlurred = day.day > 2 && !showFull; // blur past first 2 days
          return (
            <div
              key={day.day}
              className={`mb-4 p-3 border rounded-lg ${isBlurred ? "blur-sm select-none" : ""}`}
            >
              <strong>Day {day.day}: {day.title}</strong>
              <p>{day.description}</p>

              {day.viatorId && (
                <a
                  href={`https://www.viator.com/tours/.../${day.viatorId}?partner=${VIATOR_AFFILIATE_ID}`}
                  target="_blank"
                  className="text-blue-600 underline mr-2"
                >
                  Book Activity
                </a>
              )}
              {day.expediaId && (
                <a
                  href={`https://www.expedia.com/Hotel-Name-Hotel.${day.expediaId}?affcid=${EXPEDIA_AFFILIATE_ID}`}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  Book Hotel
                </a>
              )}
            </div>
          );
        })}

        {itinerary.length > 2 && !showFull && (
          <button
            onClick={() => setShowFull(true)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Unlock Full Itinerary
          </button>
        )}
      </div>
    </div>
  );
}
