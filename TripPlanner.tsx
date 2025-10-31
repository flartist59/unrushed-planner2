import React, { useState } from "react";

export default function TripPlanner() {
  const [destination, setDestination] = useState("");
  const [itinerary, setItinerary] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateItinerary = () => {
    if (!destination) return;
    setLoading(true);

    // Simulate AI/planner delay
    setTimeout(() => {
      setItinerary([
        `Day 1: Arrival in ${destination}`,
        `Day 2: Explore ${destination}`,
        `Day 3: Relax and enjoy ${destination}`,
      ]);
      setLoading(false);
    }, 500); // 0.5 second delay
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow max-w-xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Your Trip Planner</h2>

      <input
        type="text"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder="Enter a destination"
        className="border p-2 rounded w-full mb-4"
      />

      <button
        onClick={generateItinerary}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        Generate Itinerary
      </button>

      {loading && <p>Planning your trip...</p>}

      {itinerary.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Itinerary:</h3>
          <ul className="list-disc pl-5">
            {itinerary.map((day, index) => (
              <li key={index}>{day}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
