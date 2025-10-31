import React, { useState, useCallback } from 'react';
import { generateItinerary } from './services/geminiService';
import type { Message, Itinerary } from './types';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import LoadingSpinner from './components/LoadingSpinner';

interface PlanDetails {
  destination: string;
  tripLength: string;
  tripType: string;
}

const TripPlanner: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      content: "Hello! I'm your Unrushed Europe travel assistant. Fill out the details to start planning your perfect trip.",
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

    const { destination, tripLength, tripType } = details;
    const prompt = `Create a ${tripLength} ${tripType} trip to ${destination}, day by day.`;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);

    try {
      const result = await generateItinerary(prompt); // Your Gemini AI service
      setItinerary(result);
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: 'Here’s your initial itinerary. Unlock full version for all days and PDF.',
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      setError(`Sorry, could not generate itinerary. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUnlock = () => {
    // Placeholder: Stripe payment + PDF logic here
    setShowFull(true);
  };

  const handleReset = () => {
    setMessages([
      {
        id: '1',
        role: 'model',
        content: "Let's plan a new adventure! Where would you like to go?",
      },
    ]);
    setError(null);
    setItinerary(null);
    setShowFull(false);
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 rounded-lg shadow-lg">
      <header className="bg-white border-b border-stone-200 p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-teal-800">Unrushed Europe AI Planner</h1>
          <button 
            onClick={handleReset} 
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 text-sm font-semibold">
            Start Over
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="container mx-auto max-w-3xl">
          <InputBar onPlanTrip={handlePlanTrip} isLoading={isLoading} />
          {isLoading && <LoadingSpinner />}
          {error && <div className="text-red-600 mt-4">{error}</div>}

          {itinerary && (
            <div className="mt-4 space-y-2">
              {itinerary.days.map((day, index) => (
                <div key={index} className={index > 1 && !showFull ? 'blur-md' : ''}>
                  <h2 className="font-bold">Day {index + 1}: {day.title}</h2>
                  <p>{day.activities}</p>
                </div>
              ))}
              {!showFull && (
                <button 
                  onClick={handleUnlock} 
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 font-semibold">
                  Unlock Full Itinerary + PDF
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
