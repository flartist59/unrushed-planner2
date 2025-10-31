import React, { useState, useCallback } from 'react';
import { generateItinerary } from './services/geminiService';
import type { Message, Itinerary, PlanDetails } from './types';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import LoadingSpinner from './components/LoadingSpinner';

const TripPlanner: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      content:
        "Hello! I'm your Unrushed Europe travel assistant. Please fill out the details below to start planning your perfect trip.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [showFullItinerary, setShowFullItinerary] = useState(false);

  const handlePlanTrip = useCallback(async (details: PlanDetails) => {
    setIsLoading(true);
    setError(null);

    const prompt = `A ${details.tripLength} trip to ${details.destination} with a ${details.travelPace.toLowerCase()} travel pace.`;

    try {
      const generatedItinerary = await generateItinerary(prompt);
      setItinerary(generatedItinerary);
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: prompt,
      };
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "Here’s your itinerary! Scroll below to see the plan.",
      };
      setMessages(prev => [...prev, userMessage, modelMessage]);
    } catch (e) {
      console.error(e);
      const errorMessage =
        e instanceof Error ? e.message : 'An unknown error occurred.';
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
        content:
          "Let's plan a new adventure! Where would you like to go on your unrushed European holiday?",
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
          <h1 className="text-2xl md:text-3xl font-bold text-teal-800">
            Unrushed Europe AI Planner
          </h1>
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
          <InputBar
            onPlanTrip={handlePlanTrip}
            isLoading={isLoading}
          />
          {/* Type Assist positioned right below InputBar */}
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
            TypeAssist: Start typing your destination and the AI will help you.
          </div>

          {isLoading && <LoadingSpinner />}

          {itinerary && (
            <div className="mt-6 space-y-6">
              <h2 className="text-xl font-bold text-teal-700">
                {itinerary.tripTitle}
              </h2>
              <p className="italic">{itinerary.summary}</p>

              {itinerary.dailyPlan.map((day, index) => {
                const isBlurred = !showFullItinerary && index > 0;
                return (
                  <div
                    key={day.day}
                    className={`p-4 border rounded-md ${
                      isBlurred ? 'blur-sm pointer-events-none' : ''
                    }`}
                  >
                    <h3 className="font-semibold text-lg">
                      Day {day.day}: {day.title}
                    </h3>
                    <p>
                      <strong>Morning:</strong> {day.morningActivity.name} –{' '}
                      {day.morningActivity.description}
                    </p>
                    <p className="text-sm text-gray-600">
                      Accessibility: {day.morningActivity.accessibilityNote}
                    </p>
                    <p>
                      <strong>Afternoon:</strong> {day.afternoonActivity.name} –{' '}
                      {day.afternoonActivity.description}
                    </p>
                    <p className="text-sm text-gray-600">
                      Accessibility: {day.afternoonActivity.accessibilityNote}
                    </p>
                    <p>
                      <strong>Evening:</strong> {day.eveningSuggestion}
                    </p>
                  </div>
                );
              })}

              {!showFullItinerary && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowFullItinerary(true)}
                    className="px-6 py-3 bg-yellow-400 text-white font-semibold rounded-lg hover:bg-yellow-500 transition-colors duration-300"
                  >
                    Unlock Full Itinerary
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TripPlanner;
