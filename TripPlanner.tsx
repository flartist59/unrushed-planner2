// TripPlanner.tsx
import React, { useState, useCallback } from 'react';
import { generateItinerary } from './services/geminiService';
import { loadStripe } from '@stripe/stripe-js';
import jsPDF from 'jspdf';
import ChatWindow from './components/ChatWindow';
import LoadingSpinner from './components/LoadingSpinner';

interface PlanDetails {
  destination: string;
  tripLength: string;
  travelPace: string;
}

interface DailyPlan {
  day: number;
  title: string;
  morningActivity: { name: string; description: string };
  afternoonActivity: { name: string; description: string };
  eveningSuggestion: string;
}

interface Itinerary {
  tripTitle: string;
  summary: string;
  dailyPlan: DailyPlan[];
}

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
);

const TripPlanner: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([
    {
      id: '1',
      role: 'model',
      content:
        "Hello! I'm your Unrushed Europe AI travel assistant. Fill out the details below to start your itinerary.",
    },
  ]);

  const [planDetails, setPlanDetails] = useState<PlanDetails>({
    destination: '',
    tripLength: '',
    travelPace: '',
  });

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlanTrip = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsUnlocked(false);

    const prompt = `A ${planDetails.tripLength} trip to ${planDetails.destination} with a ${planDetails.travelPace.toLowerCase()} travel pace.`;

    try {
      const generatedItinerary = await generateItinerary(prompt);
      setItinerary(generatedItinerary);
    } catch (err) {
      console.error(err);
      setError('Failed to generate itinerary. Try rephrasing your request.');
    } finally {
      setIsLoading(false);
    }
  }, [planDetails]);

  const handleUnlock = async () => {
    if (!itinerary) return;

    try {
      const pdf = new jsPDF();
      pdf.text(JSON.stringify(itinerary, null, 2), 10, 10);
      const pdfBlob = pdf.output('blob');

      const formData = new FormData();
      formData.append('pdfBlob', pdfBlob as any);

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data?.id) {
        const stripe = await stripePromise;
        await stripe?.redirectToCheckout({ sessionId: data.id });
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
          "Let's plan a new adventure! Where would you like to go on your unrushed European holiday?",
      },
    ]);
    setPlanDetails({ destination: '', tripLength: '', travelPace: '' });
    setItinerary(null);
    setIsUnlocked(false);
    setError(null);
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
        <div className="container mx-auto max-w-3xl space-y-4">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Destination"
              value={planDetails.destination}
              onChange={e =>
                setPlanDetails({ ...planDetails, destination: e.target.value })
              }
              className="p-2 border rounded"
            />
            {/* Type-assist below destination */}
            <div className="bg-white border p-2 rounded shadow-sm text-sm">
              {planDetails.destination
                ? `Suggestions for "${planDetails.destination}"`
                : 'Type to get destination suggestions...'}
            </div>

            <input
              type="text"
              placeholder="Trip Length (e.g., 3 days)"
              value={planDetails.tripLength}
              onChange={e =>
                setPlanDetails({ ...planDetails, tripLength: e.target.value })
              }
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Travel Pace (e.g., relaxed, moderate)"
              value={planDetails.travelPace}
              onChange={e =>
                setPlanDetails({ ...planDetails, travelPace: e.target.value })
              }
              className="p-2 border rounded"
            />

            <button
              onClick={handlePlanTrip}
              className="px-4 py-2 bg-yellow-400 rounded font-semibold hover:bg-yellow-500 transition"
            >
              Plan My Trip
            </button>
          </div>

          {isLoading && <LoadingSpinner />}

          {itinerary && (
            <div
              className={`p-4 border rounded shadow space-y-2 ${
                !isUnlocked ? 'blur-sm' : ''
              }`}
            >
              <h2 className="text-xl font-bold">{itinerary.tripTitle}</h2>
              <p className="italic">{itinerary.summary}</p>
              <div className="space-y-2">
                {itinerary.dailyPlan.map(day => (
                  <div key={day.day} className="border-t pt-2">
                    <h3 className="font-semibold">
                      Day {day.day}: {day.title}
                    </h3>
                    <p>
                      <strong>Morning:</strong> {day.morningActivity.name} -{' '}
                      {day.morningActivity.description}
                    </p>
                    <p>
                      <strong>Afternoon:</strong> {day.afternoonActivity.name} -{' '}
                      {day.afternoonActivity.description}
                    </p>
                    <p>
                      <strong>Evening:</strong> {day.eveningSuggestion}
                    </p>
                  </div>
                ))}
              </div>

              {!isUnlocked && (
                <button
                  onClick={handleUnlock}
                  className="mt-4 px-4 py-2 bg-yellow-400 rounded font-semibold hover:bg-yellow-500 transition"
                >
                  Unlock Full Itinerary & Get PDF
                </button>
              )}
            </div>
          )}

          {error && (
            <p className="text-red-600 font-semibold mt-2">{error}</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default TripPlanner;
