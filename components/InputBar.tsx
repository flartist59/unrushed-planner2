import React, { useState, useEffect } from 'react';
import type { PlanDetails } from '../types';

interface InputBarProps {
  onPlanTrip: (details: PlanDetails) => void;
  isLoading: boolean;
}

const mockTypeAssistSuggestions = [
  'Paris, France',
  'Rome, Italy',
  'Venice, Italy',
  'Athens, Greece',
  'Barcelona, Spain',
];

const InputBar: React.FC<InputBarProps> = ({ onPlanTrip, isLoading }) => {
  const [destination, setDestination] = useState('');
  const [tripLength, setTripLength] = useState('3 Days');
  const [travelPace, setTravelPace] = useState('Relaxed');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // TypeAssist filter
  useEffect(() => {
    if (destination.length > 0) {
      const filtered = mockTypeAssistSuggestions.filter(s =>
        s.toLowerCase().includes(destination.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [destination]);

  const handleSelectSuggestion = (suggestion: string) => {
    setDestination(suggestion);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPlanTrip({ destination, tripLength, travelPace });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      {/* Destination */}
      <div className="flex flex-col relative">
        <label htmlFor="destination" className="font-semibold">
          Destination
        </label>
        <input
          id="destination"
          type="text"
          className="border p-2 rounded w-full"
          value={destination}
          onChange={e => setDestination(e.target.value)}
          disabled={isLoading}
          autoComplete="off"
        />
        {/* TypeAssist dropdown BELOW the field */}
        {showSuggestions && (
          <ul className="absolute top-full left-0 w-full bg-white border rounded shadow-md z-50 mt-1 max-h-40 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => handleSelectSuggestion(s)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Trip Length */}
      <div>
        <label htmlFor="tripLength" className="font-semibold">
          Trip Length
        </label>
        <select
          id="tripLength"
          className="border p-2 rounded w-full"
          value={tripLength}
          onChange={e => setTripLength(e.target.value)}
          disabled={isLoading}
        >
          <option>1 Day</option>
          <option>2 Days</option>
          <option>3 Days</option>
          <option>4 Days</option>
          <option>5 Days</option>
          <option>7 Days</option>
        </select>
      </div>

      {/* Travel Pace */}
      <div>
        <label htmlFor="travelPace" className="font-semibold">
          Travel Pace
        </label>
        <select
          id="travelPace"
          className="border p-2 rounded w-full"
          value={travelPace}
          onChange={e => setTravelPace(e.target.value)}
          disabled={isLoading}
        >
          <option>Relaxed</option>
          <option>Moderate</option>
          <option>Fast-Paced</option>
        </select>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors duration-300"
      >
        {isLoading ? 'Planning...' : 'Plan My Trip'}
      </button>
    </form>
  );
};

export default InputBar;
