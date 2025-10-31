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
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [blurCutoffDay, setBlurCutoffDay] = useState(2); // e.g., blur after day 1
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlanTrip = useCallback(async (details: PlanDetails) => {
    setIsLoading(true);
    setError(null);

    const { destination, tripLength, travelPace } = details;
    const prompt = `A ${tripLength} trip to ${destination} with a ${travelPace.toLowerCase()} travel pace.`;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);

    try {
      const result = await generateItinerary(prompt);
      setItinerary(result);

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `Your itinerary for ${destination} has been generated! Scroll below to view each day.`,
      };
      setMessages(prev => [...prev, modelMessage]);
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
    setError(null);
  };

  // Stripe checkout
  const handleUnlockItinerary = async () => {
    if (!itinerary) return;

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfContent: JSON.stringify(itinerary) }),
      });
      const data = await res.json();
      if (data.id) {
        const stripe = (window as any).Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
        await stripe.redirectToCheckout({ sessionId: data.id });
      }
    } catch (err) {
      console.error('Stripe checkout error', err);
    }
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
        <div className="container mx-auto max-w-3xl space-y-6">
          {/* Destination fields + TypeAssist */}
          <InputBar onPlanTrip={handlePlanTrip} isLoading={isLoading} />

          {isLoading && <LoadingSpinner />}

          {itinerary && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">{itinerary.tripTitle}</h2>
              <p className="italic">{itinerary.summary}</p>

              {itinerary.dailyPlan.map(day => (
                <div
                  key={day.day}
                  className={`border p-4 rounded bg-white shadow-sm space-y-2 ${
                    day.day >= blurCutoffDay ? 'blur-sm pointer-events-none select-none' : ''
                  }`}
                >
                  <h3 className="font-semibold">
                    Day {day.day}: {day.title}
                  </h3>
                  <div>
                    <strong>Morning:</strong> {day.morningActivity.name} — {day.morningActivity.description}
                  </div>
                  <div className="text-sm text-gray-500 italic">{day.morningActivity.accessibilityNote}</div>
                  <div>
                    <strong>Afternoon:</strong> {day.afternoonActivity.name} — {day.afternoonActivity.description}
                  </div>
                  <div className="text-sm text-gray-500 italic">{day.afternoonActivity.accessibilityNote}</div>
                  <div>
                    <strong>Evening Suggestion:</strong> {day.eveningSuggestion}
                  </div>
                </div>
              ))}

              {/* Unlock button only if blurred */}
              {blurCutoffDay <= itinerary.dailyPlan.length && (
                <button
                  onClick={handleUnlockItinerary}
                  className="mt-4 px-6 py-3 bg-yellow-400 text-white font-semibold rounded-lg hover:bg-yellow-500 transition-colors duration-300"
                >
                  Unlock Full Itinerary
                </button>
              )}
            </div>
          )}

          {error && <div className="text-red-600 font-semibold">{error}</div>}
        </div>
      </main>
    </div>
  );
};

export default TripPlanner;
