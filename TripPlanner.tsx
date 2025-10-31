import React, { useState, useCallback } from 'react';
import { generateItinerary } from './services/geminiService';
import type { Message, Itinerary } from './types';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import LoadingSpinner from './components/LoadingSpinner';

interface PlanDetails {
  destination: string;
  tripLength: string;
  travelPace: string;
}

const TripPlanner: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      content: "Hello! I'm your Unrushed Europe travel assistant. Please fill out the details below to start planning your perfect trip.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [showFullItinerary, setShowFullItinerary] = useState(false);

  const handlePlanTrip = useCallback(async (details: PlanDetails) => {
    setIsLoading(true);
    setError(null);

    const { destination, tripLength, travelPace } = details;
    const prompt = `A ${tripLength} trip to ${destination} with a ${travelPace.toLowerCase()} travel pace.`;

    try {
      const generatedItinerary = await generateItinerary(prompt);
      setItinerary(generatedItinerary);

      const userMessage: Message = { id: Date.now().toString(), role: 'user', content: prompt };
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "Here's a preview of your itinerary. Unlock full details with the button below.",
      };
      setMessages(prev => [...prev, userMessage, modelMessage]);
      setShowFullItinerary(false);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      setError(`Sorry, I couldn't generate an itinerary. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUnlockItinerary = () => {
    // Placeholder: this is where Stripe checkout will go later
    setShowFullItinerary(true);
  };

  const handleReset = () => {
    setMessages([
      {
        id: '1',
        role: 'model',
        content: "Let's plan a new adventure! Where would you like to go on your unrushed European holiday?",
      },
    ]);
    setError(null);
    setItinerary(null);
    setShowFullItinerary(false);
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 rounded-lg shadow-lg">
      <header className="bg-white border-b border-stone-200 p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-teal-800">Unrushed Europe AI Planner</h1>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 text-sm font-semibold"
          >
            Start Over
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="container mx-auto max-w-3xl">
          <InputBar onPlanTrip={handlePlanTrip} isLoading={isLoading} />
          {isLoading && <LoadingSpinner />}
          {itinerary && (
            <div className="mt-4">
              <h2 className="text-xl font-bold mb-2">{itinerary.tripTitle}</h2>
              <p className="mb-4">{itinerary.summary}</p>
              {itinerary.dailyPlan.map((day, index) => (
                <div key={index} className={`${!showFullItinerary && index > 0 ? 'blur-sm' : ''} mb-4 p-2 border rounded`}>
                  <h3 className="font-semibold">Day {day.day}: {day.title}</h3>
                  <p><strong>Morning:</strong> {day.morningActivity.name} - {day.morningActivity.description}</p>
                  <p><em>Accessibility:</em> {day.morningActivity.accessibilityNote}</p>
                  <p><strong>Afternoon:</strong> {day.afternoonActivity.name} - {day.afternoonActivity.description}</p>
                  <p><em>Accessibility:</em> {day.afternoonActivity.accessibilityNote}</p>
                  <p><strong>Evening:</strong> {day.eveningSuggestion}</p>
                </div>
              ))}
              {!showFullItinerary && (
                <button
                  onClick={handleUnlockItinerary}
                  className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-300 font-semibold"
                >
                  Unlock Full Itinerary
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TripPlanner;
