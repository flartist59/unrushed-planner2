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
      content: "Hello! I'm your Unrushed Europe travel assistant. Fill in the details below to start planning your perfect trip.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePlanTrip = useCallback(async (details: PlanDetails) => {
    setIsLoading(true);
    setError(null);

    const prompt = `Plan a ${details.tripLength} trip to ${details.destination} with a ${details.travelPace.toLowerCase()} pace.`;

    try {
      const result = await generateItinerary(prompt);
      setItinerary(result);
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'model', content: `Itinerary generated for ${details.destination}!` },
      ]);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      setError(`Failed to generate itinerary: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = () => {
    setMessages([
      {
        id: '1',
        role: 'model',
        content: "Let's plan a new adventure! Enter your destination and trip details below.",
      },
    ]);
    setItinerary(null);
    setShowFull(false);
    setError(null);
  };

  const handleUnlock = () => {
    if (!itinerary) return;
    // Call your backend checkout session
    fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdfContent: JSON.stringify(itinerary) }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          window.location.href = `https://checkout.stripe.com/pay/${data.id}`; // Replace with proper Stripe redirect
        }
      })
      .catch(err => console.error(err));
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
          {error && <div className="text-red-600 my-4">{error}</div>}

          {itinerary && (
            <div className={`transition-all duration-500 ${!showFull ? 'blur-sm pointer-events-none' : ''} mt-6`}>
              <h2 className="text-xl font-bold mb-2">{itinerary.tripTitle}</h2>
              <p className="mb-4">{itinerary.summary}</p>
              {itinerary.dailyPlan.map(day => (
                <div key={day.day} className="mb-4 p-3 border rounded-lg bg-white shadow-sm">
                  <h3 className="font-semibold">{`Day ${day.day}: ${day.title}`}</h3>
                  <div className="mt-2">
                    <strong>Morning:</strong> {day.morningActivity.name} - {day.morningActivity.description}
                    <div className="text-sm text-gray-500">{day.morningActivity.accessibilityNote}</div>
                  </div>
                  <div className="mt-2">
                    <strong>Afternoon:</strong> {day.afternoonActivity.name} - {day.afternoonActivity.description}
                    <div className="text-sm text-gray-500">{day.afternoonActivity.accessibilityNote}</div>
                  </div>
                  <div className="mt-2">
                    <strong>Evening:</strong> {day.eveningSuggestion}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!showFull && itinerary && (
            <button
              onClick={handleUnlock}
              className="mt-4 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300"
            >
              Unlock Full Itinerary & Download PDF
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default TripPlanner;
