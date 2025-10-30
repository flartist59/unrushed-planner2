import React, { useState, useRef, useEffect } from 'react';
import { europeanDestinations } from '../data/destinations';

interface PlanDetails {
  destination: string;
  tripLength: string;
  travelPace: string;
}

interface InputBarProps {
  onPlanTrip: (details: PlanDetails) => void;
  isLoading: boolean;
}

const PlanIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 1.5a.75.75 0 0 1 .75.75V3a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 12 1.5ZM18.679 4.26a.75.75 0 0 1 .163 1.047l-.82 1.23a.75.75 0 1 1-1.214-.81l.82-1.23a.75.75 0 0 1 1.051-.237ZM21.75 12a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75ZM18.742 18.679a.75.75 0 0 1 1.047-.163l1.23.82a.75.75 0 0 1-.81 1.214l-1.23-.82a.75.75 0 0 1-.237-1.051ZM12 21.75a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 1.5 0v1.5a.75.75 0 0 1-.75.75ZM5.26 18.742a.75.75 0 0 1-.163-1.047l.82-1.23a.75.75 0 1 1 1.214.81l-.82 1.23a.75.75 0 0 1-1.051.237ZM2.25 12c0 .414.336.75.75.75h1.5a.75.75 0 0 1 0-1.5H3a.75.75 0 0 1-.75.75ZM5.197 5.26a.75.75 0 0 1-.81-1.214l1.23-.82a.75.75 0 0 1 1.047.163l.237 1.051Z" />
        <path fillRule="evenodd" d="M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5ZM10.5 12a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clipRule="evenodd" />
    </svg>
);


const InputBar: React.FC<InputBarProps> = ({ onPlanTrip, isLoading }) => {
  const [destination, setDestination] = useState('');
  const [tripLength, setTripLength] = useState('');
  const [travelPace, setTravelPace] = useState('Leisurely');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const destinationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestination(value);

    if (value.length > 0) {
      const valueLower = value.toLowerCase();
      
      // Enhanced search logic with scoring for better relevance
      const rankedSuggestions = europeanDestinations
        .map(dest => {
          const destLower = dest.toLowerCase();
          let score = 0;
          if (destLower.startsWith(valueLower)) {
            score = 100; // High score for starting match
          } else if (destLower.includes(valueLower)) {
            score = 10; // Lower score for includes match
          }
          
          // Penalize by length to favor shorter, more precise matches
          if (score > 0) {
            score -= dest.length;
          }

          return { suggestion: dest, score };
        })
        .filter(item => item.score > 0) // Filter out non-matches
        .sort((a, b) => b.score - a.score) // Sort by score descending
        .map(item => item.suggestion)
        .slice(0, 5); // Take top 5

      setSuggestions(rankedSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setDestination(suggestion);
    setSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination.trim() && tripLength.trim() && !isLoading) {
      onPlanTrip({ destination, tripLength, travelPace });
      // Keep inputs filled for context, user can clear them with the "Start Over" button.
    }
  };

  const inputStyles = "w-full px-4 py-3 text-lg bg-stone-100 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow duration-200 disabled:opacity-50";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div ref={destinationRef} className="relative">
          <label htmlFor="destination" className="block text-sm font-medium text-stone-600 mb-1">Destination</label>
          <input 
            id="destination" 
            type="text" 
            value={destination} 
            onChange={handleDestinationChange} 
            placeholder="e.g., Paris, France" 
            disabled={isLoading} 
            className={inputStyles}
            required
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-stone-200 rounded-lg mt-1 shadow-xl max-h-60 overflow-y-auto bottom-full mb-2">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion}
                  className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-stone-700"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label htmlFor="tripLength" className="block text-sm font-medium text-stone-600 mb-1">Trip length</label>
          <input 
            id="tripLength" 
            type="text" 
            value={tripLength} 
            onChange={(e) => setTripLength(e.target.value)} 
            placeholder="e.g., 5 days" 
            disabled={isLoading} 
            className={inputStyles}
            required
          />
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <label htmlFor="travelPace" className="block text-sm font-medium text-stone-600 mb-1">Travel pace</label>
          <select 
            id="travelPace" 
            value={travelPace} 
            onChange={(e) => setTravelPace(e.target.value)} 
            disabled={isLoading} 
            className={inputStyles}
          >
            <option>Leisurely</option>
            <option>Gentle</option>
            <option>Balanced</option>
          </select>
        </div>
      </div>
       <button
        type="submit"
        disabled={isLoading || !destination.trim() || !tripLength.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors duration-300 font-semibold text-lg"
        aria-label="Plan my trip"
      >
        <PlanIcon />
        <span>{isLoading ? 'Planning...' : 'Plan My Trip'}</span>
      </button>
    </form>
  );
};

export default InputBar;