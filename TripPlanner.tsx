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
        "Hello! I'm Layla, your Unrushed Europe travel assistant. Fill out the details below to start planning your perfect trip.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [locked, setLocked] = useState(true);

  const handlePlanTrip = useCallback(
    async (details: PlanDetails) => {
      setIsLoading(true);
      setError(null);
      setLocked(true);
      const { destination, tripLength, travelPace } = details;
      const prompt = `A ${tripLength} trip to ${destination} with a ${travelPace.toLowerCase()} travel pace.`;

      const userMessage: Message = { id: Date.now().toString(), role: 'user', content: prompt };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const newItinerary = await generateItinerary(prompt);
        setItinerary(newItinerary);

        const modelMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: `Here's your partial itinerary for ${destination}:`,
        };
        setMessages((prev) => [...prev, modelMessage]);
      } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        setError(`Failed to generate itinerary: ${errorMessage}`);
        const modelErrorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: `I'm sorry, I encountered a problem while planning your trip. Please try again. (Error: ${errorMessage})`,
        };
        setMessages((prev) => [...prev, modelErrorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleUnlock = async () => {
    // Redirect to Stripe checkout
    if (!itinerary) return;
    try {
      const pdfBlob = JSON.stringify(itinerary); // send JSON to your backend
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBlob }),
      });
      const data = await res.json();
      if (data.id) {
        window.location.href = `https://checkout.stripe.com/pay/${data.id}`;
      }
    } catch (err) {
      console.error(err);
      setError('Failed to initiate payment. Please try again.');
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: '1',
        role: 'model',
        content:
          "Let's plan a new adventure! Where would you like to go on your Unrushed European holiday?",
      },
    ]);
    setError(null);
    setItinerary(null);
    setLocked(true);
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
          {error && <div className="text-red-600 mt-4">{error}</div>}

          {itinerary && (
            <div className="mt-6 space-y-4">
              <h2 className="text-xl font-bold">{itinerary.tripTitle}</h2>
              <p className="italic">{itinerary.summary}</p>

              {itinerary.dailyPlan.map((day, idx) => (
                <div
                  key={day.day}
                  className={`border rounded p-4 ${locked && idx >= 1 ? 'blur-sm pointer-events-none' : ''}`}
                >
                  <h3 className="font-semibold mb-2">
                    Day {day.day}: {day.title}
                  </h3>
                  <div>
                    <strong>Morning:</strong> {day.morningActivity.name} — {day.morningActivity.description}
                    <br />
                    <em>Accessibility:</em> {day.morningActivity.accessibilityNote}
                  </div>
                  <div className="mt-2">
                    <strong>Afternoon:</strong> {day.afternoonActivity.name} — {day.afternoonActivity.description}
                    <br />
                    <em>Accessibility:</em> {day.afternoonActivity.accessibilityNote}
                  </div>
                  <div className="mt-2">
                    <strong>Evening Suggestion:</strong> {day.eveningSuggestion}
                  </div>
                </div>
              ))}

              {locked && (
                <button
                  onClick={handleUnlock}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 text-sm font-semibold"
                >
                  Unlock Full Itinerary & Get PDF
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
