import React, { useState, useCallback } from 'react';
import { generateItinerary } from './services/geminiService';
import type { Message, Itinerary } from './types';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import LoadingSpinner from './components/LoadingSpinner';
import jsPDF from 'jspdf';

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
  const [fullItinerary, setFullItinerary] = useState<string | null>(null);

  const handlePlanTrip = useCallback(async (details: PlanDetails) => {
    setIsLoading(true);
    setError(null);

    const { destination, tripLength, travelPace } = details;
    const prompt = `A ${tripLength} trip to ${destination} with a ${travelPace.toLowerCase()} travel pace.`;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);

    try {
      const itinerary = await generateItinerary(prompt);
      setFullItinerary(itinerary); // save full itinerary for PDF/Stripe
      const blurredItinerary = itinerary
        .split('\n')
        .map((line, index) => (index < 2 ? line : '•••')) // blur past first 2 lines
        .join('\n');

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: blurredItinerary,
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Sorry, I couldn't generate an itinerary. ${errorMessage}`);
      const modelErrorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `I'm sorry, I encountered a problem while planning your trip. Please try again. (Error: ${errorMessage})`,
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
    setFullItinerary(null);
  };

  const handleUnlockPDF = async () => {
    if (!fullItinerary) return;

    // Create PDF
    const doc = new jsPDF();
    doc.setFontSize(12);
    const lines = fullItinerary.split('\n');
    lines.forEach((line, idx) => doc.text(line, 10, 10 + idx * 7));
    const pdfBlob = doc.output('blob');

    // Create checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdfBlob }),
    });

    const session = await response.json();

    // Redirect to Stripe
    const stripe = (window as any).Stripe(import.meta.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
    await stripe.redirectToCheckout({ sessionId: session.id });
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
          <ChatWindow messages={messages} />
          {isLoading && <LoadingSpinner />}
        </div>
      </main>

      {fullItinerary && (
        <div className="bg-white border-t border-stone-200 p-4 flex justify-center gap-4">
          <button
            onClick={handleUnlockPDF}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 font-semibold"
          >
            Unlock Full Itinerary & Get PDF
          </button>
        </div>
      )}

      <footer className="bg-white border-t border-stone-200 p-4">
        <div className="container mx-auto max-w-3xl">
          <InputBar onPlanTrip={handlePlanTrip} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  );
};

export default TripPlanner;
