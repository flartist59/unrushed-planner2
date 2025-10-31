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
  const [planDetails, setPlanDetails] = useState<PlanDetails>({
    destination: '',
    tripLength: '',
    travelPace: '',
  });

  const handlePlanTrip = useCallback(async (details: PlanDetails) => {
    setIsLoading(true);
    setError(null);

    const prompt = `A ${details.tripLength} trip to ${details.destination} with a ${details.travelPace.toLowerCase()} travel pace.`;

    // Add user message immediately
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);

    try {
      const itinerary: Itinerary = await generateItinerary(prompt);

      // Push AI response as pretty JSON or formatted string
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: JSON.stringify(itinerary, null, 2), // replace with formatted rendering if needed
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      console.error('TripPlanner error:', err);
      setError('Sorry, there was an error generating your itinerary. Please try again.');
      const modelErrorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: 'Error: Failed to generate itinerary from AI model.',
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
    setPlanDetails({ destination: '', tripLength: '', travelPace: '' });
    setError(null);
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 rounded-lg shadow-lg">
      <header className="bg-white border-b border-stone-200 p-4 shadow-sm">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-teal-800">Unrushed Europe AI Planner</h1>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 text-sm font-semibold"
          >
            Start Over
          </button>
        </div>

        {/* Always show destination input with type assist */}
        <div className="mt-4">
          <InputBar
            onPlanTrip={handlePlanTrip}
            isLoading={isLoading}
            details={planDetails}
            setDetails={setPlanDetails}
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="container mx-auto max-w-3xl">
          <ChatWindow messages={messages} />
          {isLoading && <LoadingSpinner />}
          {error && <div className="mt-4 text-red-600 font-semibold">{error}</div>}
        </div>
      </main>
    </div>
  );
};

export default TripPlanner;
