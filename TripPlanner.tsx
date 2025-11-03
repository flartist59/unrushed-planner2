import React, { useState, useCallback } from 'react';
import { generateItinerary } from './services/geminiService';
import type { Message, Itinerary, PlanDetails } from './types';
import InputBar from './components/InputBar';
import LoadingSpinner from './components/LoadingSpinner';
import StripeCheckout from './components/StripeCheckout';
import PDFDownloadButton from './components/PDFGenerator';

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
  const [blurCutoffDay, setBlurCutoffDay] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  const handlePlanTrip = useCallback(async (details: PlanDetails) => {
    setIsLoading(true);
    setError(null);
    setHasPaid(false);

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
        content: `Your itinerary for ${destination} has been generated! Scroll below to view the first day for free.`,
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
    setShowPayment(false);
    setHasPaid(false);
  };

  const handlePaymentSuccess = () => {
    setHasPaid(true);
    setShowPayment(false);
    setBlurCutoffDay(999);
    
    const successMessage: Message = {
      id: Date.now().toString(),
      role: 'model',
      content: '🎉 Payment successful! Your complete itinerary is now unlocked. You can download it as a PDF below.',
    };
    setMessages(prev => [...prev, successMessage]);
  };

  const handleUnlockItinerary = () => {
    setShowPayment(true);
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
          <InputBar onPlanTrip={handlePlanTrip} isLoading={isLoading} />

          {isLoading && <LoadingSpinner />}

          {showPayment && !hasPaid && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <StripeCheckout
                  amount={799}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => setShowPayment(false)}
                />
              </div>
            </div>
          )}

          {itinerary && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-teal-800 mb-2">{itinerary.tripTitle}</h2>
                <p className="text-stone-600 italic">{itinerary.summary}</p>
              </div>

              {!hasPaid && blurCutoffDay <= itinerary.dailyPlan.length && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-2xl">👀</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-900 mb-1">Free Preview</h3>
                      <p className="text-sm text-yellow-800 mb-3">
                        You're viewing Day 1 for free! Unlock the complete {itinerary.dailyPlan.length}-day itinerary 
                        with all activities, recommendations, and a downloadable PDF for just $7.99.
                      </p>
                      <button
                        onClick={handleUnlockItinerary}
                        className="px-6 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors duration-300 shadow-md"
                      >
                        Unlock Full Itinerary - $7.99
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {itinerary.dailyPlan.map(day => (
                <div
                  key={day.day}
                  className={`border border-stone-200 p-5 rounded-lg bg-white shadow-sm space-y-3 transition-all ${
                    day.day >= blurCutoffDay ? 'blur-sm pointer-events-none select-none relative' : ''
                  }`}
                >
                  {day.day >= blurCutoffDay && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg">
                        🔒 Unlock to View
                      </div>
                    </div>
                  )}
                  
                  <h3 className="text-lg font-bold text-teal-800">
                    Day {day.day}: {day.title}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="bg-amber-50 p-3 rounded border-l-4 border-amber-400">
                      <strong className="text-amber-900">🌅 Morning:</strong>
                      <p className="mt-1 text-stone-700">
                        <span className="font-medium">{day.morningActivity.name}</span> — {day.morningActivity.description}
                      </p>
                      {day.morningActivity.accessibilityNote && (
                        <p className="text-xs text-stone-500 italic mt-1">
                          ♿ {day.morningActivity.accessibilityNote}
                        </p>
                      )}
                    </div>

                    <div className="bg-sky-50 p-3 rounded border-l-4 border-sky-400">
                      <strong className="text-sky-900">☀️ Afternoon:</strong>
                      <p className="mt-1 text-stone-700">
                        <span className="font-medium">{day.afternoonActivity.name}</span> — {day.afternoonActivity.description}
                      </p>
                      {day.afternoonActivity.accessibilityNote && (
                        <p className="text-xs text-stone-500 italic mt-1">
                          ♿ {day.afternoonActivity.accessibilityNote}
                        </p>
                      )}
                    </div>

                    <div className="bg-indigo-50 p-3 rounded border-l-4 border-indigo-400">
                      <strong className="text-indigo-900">🌙 Evening:</strong>
                      <p className="mt-1 text-stone-700">{day.eveningSuggestion}</p>
                    </div>
                  </div>
                </div>
              ))}

              {hasPaid && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-3">
                    ✅ Your Complete Itinerary is Ready!
                  </h3>
                  <p className="text-stone-600 mb-4">
                    Download your personalized {itinerary.dailyPlan.length}-day European adventure as a PDF.
                  </p>
                  <PDFDownloadButton 
                    itineraryData={{
                      tripTitle: itinerary.tripTitle,
                      summary: itinerary.summary,
                      dailyPlan: itinerary.dailyPlan
                    }} 
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TripPlanner;