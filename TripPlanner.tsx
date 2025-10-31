import React, { useState, useCallback } from 'react';
import { generateItinerary } from './services/geminiService';
import type { Message, Itinerary } from './types';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import LoadingSpinner from './components/LoadingSpinner';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

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
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handlePlanTrip = useCallback(async (details: PlanDetails) => {
    setIsLoading(true);
    setError(null);

    const { destination, tripLength, travelPace } = details;
    const prompt = `A ${tripLength} trip to ${destination} with a ${travelPace.toLowerCase()} travel pace.`;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);

    try {
      const generatedItinerary = await generateItinerary(prompt);
      setItinerary(generatedItinerary);
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "Itinerary generated! Scroll down to view the summary. Full itinerary is locked until unlocked.",
      };
      setMessages(prev => [...prev, modelMessage]);
      setIsUnlocked(false); // Reset unlock for new trip
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
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
    setItinerary(null);
    setIsUnlocked(false);
    setError(null);
  };

  const handleUnlockItinerary = async () => {
    if (!itinerary) return;
    try {
      const stripe = await stripePromise;
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBlob: JSON.stringify(itinerary) }),
      });
      const session = await res.json();
      if (session.id) {
        await stripe?.redirectToCheckout({ sessionId: session.id });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to start checkout. Please try again.');
    }
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
          <ChatWindow messages={messages} />
          {itinerary && (
            <div className="mt-4">
              <h2 className="text-xl font-bold mb-2">{itinerary.tripTitle}</h2>
              <p className="mb-4">{itinerary.summary}</p>

              {itinerary.dailyPlan.map(day => (
                <div key={day.day} className={isUnlocked ? '' : 'blur-sm'}>
                  <h3 className="font-semibold mt-4">Day {day.day}: {day.title}</h3>
                  <div>
                    <strong>Morning:</strong> {day.morningActivity.name} - {day.morningActivity.description}
                    <br /><em>Accessibility:</em> {day.morningActivity.accessibilityNote}
                  </div>
                  <div>
                    <strong>Afternoon:</strong> {day.afternoonActivity.name} - {day.afternoonActivity.description}
                    <br /><em>Accessibility:</em> {day.afternoonActivity.accessibilityNote}
                  </div>
                  <div>
                    <strong>Evening Suggestion:</strong> {day.eveningSuggestion}
                  </div>
                </div>
              ))}

              {!isUnlocked && (
                <button
                  onClick={handleUnlockItinerary}
                  className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500"
                >
                  Unlock Full Itinerary
                </button>
              )}
            </div>
          )}

          {isLoading && <LoadingSpinner />}
          {error && <p className="text-red-600 mt-2">{error}</p>}

          <div className="mt-6">
            <InputBar onPlanTrip={handlePlanTrip} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TripPlanner;
