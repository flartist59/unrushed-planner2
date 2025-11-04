import React, { useState, useEffect } from 'react';
import type { PlanDetails } from '../types';

interface InputBarProps {
  onPlanTrip: (details: PlanDetails) => void;
  isLoading: boolean;
}

const europeanDestinations = [
  // France
  'Paris, France', 'Nice, France', 'Lyon, France', 'Marseille, France', 'Bordeaux, France', 
  'Strasbourg, France', 'Toulouse, France', 'Provence, France', 'French Riviera, France',
  'Normandy, France', 'Loire Valley, France', 'Mont Saint-Michel, France',
  
  // Italy
  'Rome, Italy', 'Venice, Italy', 'Florence, Italy', 'Milan, Italy', 'Naples, Italy',
  'Turin, Italy', 'Bologna, Italy', 'Verona, Italy', 'Pisa, Italy', 'Siena, Italy',
  'Cinque Terre, Italy', 'Amalfi Coast, Italy', 'Sicily, Italy', 'Sardinia, Italy',
  'Lake Como, Italy', 'Tuscany, Italy', 'Pompeii, Italy', 'Capri, Italy',
  
  // Spain
  'Barcelona, Spain', 'Madrid, Spain', 'Seville, Spain', 'Valencia, Spain', 'Granada, Spain',
  'Bilbao, Spain', 'Malaga, Spain', 'Toledo, Spain', 'Cordoba, Spain', 'San Sebastian, Spain',
  'Ibiza, Spain', 'Mallorca, Spain', 'Costa del Sol, Spain', 'Basque Country, Spain',
  
  // Greece
  'Athens, Greece', 'Santorini, Greece', 'Mykonos, Greece', 'Crete, Greece', 'Rhodes, Greece',
  'Corfu, Greece', 'Thessaloniki, Greece', 'Delphi, Greece', 'Meteora, Greece',
  
  // United Kingdom
  'London, England', 'Edinburgh, Scotland', 'Glasgow, Scotland', 'Manchester, England',
  'Liverpool, England', 'Oxford, England', 'Cambridge, England', 'Bath, England',
  'York, England', 'Cotswolds, England', 'Lake District, England', 'Cardiff, Wales',
  'Belfast, Northern Ireland', 'Stonehenge, England',
  
  // Netherlands
  'Amsterdam, Netherlands', 'Rotterdam, Netherlands', 'The Hague, Netherlands',
  'Utrecht, Netherlands', 'Delft, Netherlands', 'Haarlem, Netherlands',
  
  // Germany
  'Berlin, Germany', 'Munich, Germany', 'Hamburg, Germany', 'Frankfurt, Germany',
  'Cologne, Germany', 'Dresden, Germany', 'Heidelberg, Germany', 'Rothenburg, Germany',
  'Black Forest, Germany', 'Bavaria, Germany', 'Rhine Valley, Germany',
  
  // Portugal
  'Lisbon, Portugal', 'Porto, Portugal', 'Algarve, Portugal', 'Sintra, Portugal',
  'Madeira, Portugal', 'Azores, Portugal', 'Evora, Portugal',
  
  // Austria
  'Vienna, Austria', 'Salzburg, Austria', 'Innsbruck, Austria', 'Hallstatt, Austria',
  
  // Switzerland
  'Zurich, Switzerland', 'Geneva, Switzerland', 'Lucerne, Switzerland', 'Interlaken, Switzerland',
  'Zermatt, Switzerland', 'Bern, Switzerland', 'Swiss Alps, Switzerland',
  
  // Czech Republic
  'Prague, Czech Republic', 'Cesky Krumlov, Czech Republic',
  
  // Belgium
  'Brussels, Belgium', 'Bruges, Belgium', 'Ghent, Belgium', 'Antwerp, Belgium',
  
  // Croatia
  'Dubrovnik, Croatia', 'Split, Croatia', 'Zagreb, Croatia', 'Hvar, Croatia',
  'Plitvice Lakes, Croatia',
  
  // Poland
  'Krakow, Poland', 'Warsaw, Poland', 'Gdansk, Poland', 'Wroclaw, Poland',
  
  // Ireland
  'Dublin, Ireland', 'Galway, Ireland', 'Cork, Ireland', 'Cliffs of Moher, Ireland',
  'Ring of Kerry, Ireland',
  
  // Hungary
  'Budapest, Hungary',
  
  // Denmark
  'Copenhagen, Denmark',
  
  // Norway
  'Oslo, Norway', 'Bergen, Norway', 'Norwegian Fjords, Norway', 'Tromso, Norway',
  
  // Sweden
  'Stockholm, Sweden', 'Gothenburg, Sweden',
  
  // Iceland
  'Reykjavik, Iceland', 'Blue Lagoon, Iceland', 'Golden Circle, Iceland',
  
  // Turkey
  'Istanbul, Turkey', 'Cappadocia, Turkey', 'Ephesus, Turkey',
];

const interestOptions = [
  { value: 'history', label: '🏛️ History & Museums', icon: '🏛️' },
  { value: 'food', label: '🍝 Food & Wine', icon: '🍝' },
  { value: 'nature', label: '🌲 Nature & Outdoors', icon: '🌲' },
  { value: 'art', label: '🎨 Art & Culture', icon: '🎨' },
  { value: 'nightlife', label: '🎉 Nightlife & Entertainment', icon: '🎉' },
  { value: 'shopping', label: '🛍️ Shopping', icon: '🛍️' },
  { value: 'relaxation', label: '🧘 Relaxation & Wellness', icon: '🧘' },
  { value: 'adventure', label: '⛰️ Adventure & Sports', icon: '⛰️' },
];

const InputBar: React.FC<InputBarProps> = ({ onPlanTrip, isLoading }) => {
  const [destination, setDestination] = useState('');
  const [tripLength, setTripLength] = useState('3 Days');
  const [travelPace, setTravelPace] = useState('Relaxed');
  const [numberOfTravelers, setNumberOfTravelers] = useState(2);
  const [interests, setInterests] = useState<string[]>([]);
  const [season, setSeason] = useState('');
  const [budgetLevel, setBudgetLevel] = useState('Moderate');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Auto-detect season based on current date
  useEffect(() => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) setSeason('Spring');
    else if (month >= 5 && month <= 7) setSeason('Summer');
    else if (month >= 8 && month <= 10) setSeason('Fall');
    else setSeason('Winter');
  }, []);

  // TypeAssist filter
  useEffect(() => {
    if (destination.length > 1) {
      const filtered = europeanDestinations.filter(s =>
        s.toLowerCase().includes(destination.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 10)); // Limit to 10 suggestions
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [destination]);

  const handleSelectSuggestion = (suggestion: string) => {
    setDestination(suggestion);
    setShowSuggestions(false);
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPlanTrip({
      destination,
      tripLength,
      travelPace,
      numberOfTravelers,
      interests,
      season,
      budgetLevel,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-center mb-4">Plan Your Perfect European Adventure</h2>

      {/* Destination */}
      <div className="flex flex-col relative">
        <label htmlFor="destination" className="font-semibold mb-2">
          Where would you like to go? *
        </label>
        <input
          id="destination"
          type="text"
          className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., 5 days Paris, 3 days Rome, 2 days Florence"
          value={destination}
          onChange={e => setDestination(e.target.value)}
          disabled={isLoading}
          autoComplete="off"
          required
        />
        <p className="text-sm text-gray-500 mt-2">
          💡 <strong>Multi-city tip:</strong> For multiple destinations, type "5 days Paris, 3 days Rome, 2 days Florence"
        </p>
        {showSuggestions && (
          <ul className="absolute top-full left-0 w-full bg-white border rounded-lg shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => handleSelectSuggestion(s)}
                className="p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b last:border-b-0"
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Two columns for Trip Length and Travelers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="tripLength" className="font-semibold mb-2 block">
            Total Trip Length *
          </label>
          <select
            id="tripLength"
            className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            value={tripLength}
            onChange={e => setTripLength(e.target.value)}
            disabled={isLoading}
            required
          >
            <option>1 Day</option>
            <option>2 Days</option>
            <option>3 Days</option>
            <option>4 Days</option>
            <option>5 Days</option>
            <option>7 Days</option>
            <option>10 Days</option>
            <option>14 Days</option>
          </select>
        </div>

        <div>
          <label htmlFor="travelers" className="font-semibold mb-2 block">
            Number of Travelers *
          </label>
          <input
            id="travelers"
            type="number"
            min="1"
            max="20"
            className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            value={numberOfTravelers}
            onChange={e => setNumberOfTravelers(parseInt(e.target.value) || 1)}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      {/* Season and Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="season" className="font-semibold mb-2 block">
            Season of Travel *
          </label>
          <select
            id="season"
            className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            value={season}
            onChange={e => setSeason(e.target.value)}
            disabled={isLoading}
            required
          >
            <option>Spring</option>
            <option>Summer</option>
            <option>Fall</option>
            <option>Winter</option>
          </select>
        </div>

        <div>
          <label htmlFor="budgetLevel" className="font-semibold mb-2 block">
            Budget Level *
          </label>
          <select
            id="budgetLevel"
            className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            value={budgetLevel}
            onChange={e => setBudgetLevel(e.target.value)}
            disabled={isLoading}
            required
          >
            <option>Budget-Friendly</option>
            <option>Moderate</option>
            <option>Luxury</option>
          </select>
        </div>
      </div>

      {/* Travel Pace */}
      <div>
        <label htmlFor="travelPace" className="font-semibold mb-2 block">
          Travel Pace *
        </label>
        <select
          id="travelPace"
          className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
          value={travelPace}
          onChange={e => setTravelPace(e.target.value)}
          disabled={isLoading}
          required
        >
          <option>Relaxed</option>
          <option>Moderate</option>
          <option>Fast-Paced</option>
        </select>
      </div>

      {/* Interests */}
      <div>
        <label className="font-semibold mb-3 block">
          What are you interested in? (Select up to 5)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {interestOptions.map(option => (
  <button
    key={option.value}
    type="button"
    onClick={() => toggleInterest(option.value)}
    disabled={isLoading || (!interests.includes(option.value) && interests.length >= 5)}
    className={`
      p-3 rounded-lg border-2 transition-all text-sm font-medium
      ${interests.includes(option.value)
        ? 'border-blue-500 bg-blue-500 text-white'
        : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
      }
      ${isLoading || (!interests.includes(option.value) && interests.length >= 5)
        ? 'opacity-50 cursor-not-allowed'
        : 'cursor-pointer'
      }
    `}
  >
    <div className="text-sm">{option.label.split(' ').slice(1).join(' ')}</div>
  </button>
))}
        </div>
        {interests.length > 0 && (
          <p className="text-sm text-white mt-2">
            Selected: {interests.length}/5
          </p>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading || !destination}
        className="w-full px-6 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {isLoading ? 'Creating Your Perfect Itinerary...' : '✨ Plan My Trip - $8.99'}
      </button>

      {/* Custom Service CTA */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <h3 className="font-bold text-purple-900 mb-2">🌟 Need Something Extra Special?</h3>
        <p className="text-sm text-purple-800 mb-3">
          Our concierge service creates ultra-personalized itineraries with restaurant reservations, 
          special experiences, and insider access. Starting at $199.
        </p>
        <button
          type="button"
          className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors text-sm"
          onClick={() => window.open('mailto:info@unrushedeurope.com?subject=Custom Concierge Service Request', '_blank')}
        >
          Request Custom Service →
        </button>
      </div>
    </form>
  );
};

export default InputBar;