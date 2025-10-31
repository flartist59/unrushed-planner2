import React, { useState } from "react";

export default function TripPlanner() {
  const [destination, setDestination] = useState("");
  const [itinerary, setItinerary] = useState<string[]>([]);

  const generateItinerary = () => {
    // TEMP: Mock itinerary for now
    setItinerary([
      "Day 1: Arrival in destination",
      "Day 2: Explore the city",
      "Day 3: Relax and enjoy local cuisine",
    ]);
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
      >
        Generate Itinerary
      </button>

      <div>
        {itinerary.length > 0 &&
          itinerary.map((day, index) => (
            <p key={index} className="mb-2">
              {day}
            </p>
          ))}
      </div>
    </div>
  );
}
