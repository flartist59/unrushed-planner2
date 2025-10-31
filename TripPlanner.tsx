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
      content: "Hello! I'm your Unrushed Europe travel assistant. Fill out the details below to start planning your perfect trip.",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [showFull, setShowFull] = useState(false);

  const handlePlanTrip = useCallback(async (details: PlanDetails) => {
    setIsLoading(true);
    setError(null);
    setItinerary(null);
    setShowFull(false);

    const { destination, tripLength, travelPace } = details;
    const prompt = `A ${tripLength} trip to ${destination} with a ${travelPace.toLowerCase()} travel pace.`;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);

    try {
      console.log("DEBUG: Sending prompt to AI:", prompt);

      const aiItinerary = await generateItinerary(prompt);

      console.log("DEBUG: AI returned itinerary:", aiItinerary);

      setItinerary(aiItinerary);

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "Itinerary generated! Scroll down to view the plan.",
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (e) {
      console.error("DEBUG: Error generating itinerary:", e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      setError(`Sorry, I couldn't generate an itinerary. ${errorMessage}`);
      const modelErrorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `I'm sorry, I encountered a problem while planning your trip. Please try rephrasing your request. (Error: ${errorMessage})`,
      };
      setMessages(prev => [...prev, modelErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    setShowFull(false);
  };

  const handleUnlock = () => {
    setShowFull(true);
    // TODO: Trigger Stripe checkout for PDF download here
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
        <div className="container mx-auto max-w-3xl space-y-4">
          {/* Chat window */}
          <ChatWindow messages={messages} />

          {/* Input fields */}
          <div className="space-y-2">
            <InputBar onPlanTrip={handlePlanTrip} isLoading={isLoading} />
          </div>

          {/* Loading spinner */}
          {isLoading && <LoadingSpinner />}

          {/* Itinerary */}
          {itinerary && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-2">{itinerary.tripTitle}</h2>
              <p className="mb-4">{itinerary.summary}</p>

              {itinerary.dailyPlan.map((day) => (
                <div key={day.day} className="mb-4 p-2 border-b border-stone-200">
                  <h3 className="font-semibold mb-1">{`Day ${day.day}: ${day.title}`}</h3>
                  <div className={`${showFull ? '' : 'blur-sm'}`}>
                    <p><strong>Morning:</strong> {day.morningActivity.name} – {day.morningActivity.description}</p>
                    <p><em>{day.morningActivity.accessibilityNote}</em></p>
                    <p><strong>Afternoon:</strong> {day.afternoonActivity.name} – {day.afternoonActivity.description}</p>
                    <p><em>{day.afternoonActivity.accessibilityNote}</em></p>
                    <p><strong>Evening:</strong> {day.eveningSuggestion}</p>
                  </div>
                </div>
              ))}

              {!showFull && (
                <button
                  onClick={handleUnlock}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 font-semibold"
                >
                  Unlock Full Itinerary & Get PDF
                </button>
              )}
            </div>
          )}

          {error && <p className="text-red-600 font-semibold">{error}</p>}
        </div>
      </main>
    </div>
  );
};

export default TripPlanner;
