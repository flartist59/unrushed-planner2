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
      content: "Hello! I'm your Unrushed Europe travel assistant. Fill out the details below to start planning your perfect trip.",
    },
  ]);
  const [planDetails, setPlanDetails] = useState<PlanDetails>({
    destination: '',
    tripLength: '',
    travelPace: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullItineraryUnlocked, setFullItineraryUnlocked] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);

  const handlePlanTrip = useCallback(async (details: PlanDetails) => {
    setIsLoading(true);
    setError(null);
    const prompt = `A ${details.tripLength} trip to ${details.destination} with a ${details.travelPace.toLowerCase()} travel pace.`;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);

    try {
      const itinerary = await generateItinerary(prompt);
      setCurrentItinerary(itinerary);

      const previewItinerary = {
        ...itinerary,
        dailyPlan: itinerary.dailyPlan.slice(0, 2), // show first 2 days preview
      };

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: previewItinerary,
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
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
    setPlanDetails({ destination: '', tripLength: '', travelPace: '' });
    setError(null);
    setFullItineraryUnlocked(false);
    setCurrentItinerary(null);
  };

  const handleUnlockItinerary = () => {
    // Hook into Stripe checkout here
    setFullItineraryUnlocked(true);
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
      </header>

      {/* InputBar is visible immediately below the header */}
      <div className="p-4 md:p-6 bg-white border-b border-stone-200">
        <InputBar
          onPlanTrip={handlePlanTrip}
          isLoading={isLoading}
          details={planDetails}
          setDetails={setPlanDetails}
        />
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="container mx-auto max-w-3xl space-y-4">
          {messages.map(msg => (
            <div 
              key={msg.id} 
              className={msg.role === 'model' ? 'bg-white p-4 rounded shadow' : 'bg-teal-50 p-4 rounded shadow'}
            >
              {msg.role === 'model' && typeof msg.content === 'object' ? (
                <div>
                  <h2 className="text-xl font-bold mb-2">{msg.content.tripTitle}</h2>
                  <p className="mb-2">{msg.content.summary}</p>
                  {msg.content.dailyPlan.map((day: any, index: number) => (
                    <div key={day.day} className="mb-4">
                      <h3 className="font-semibold text-teal-700 mb-1">Day {day.day}: {day.title}</h3>
                      <p>
                        <strong>Morning:</strong> {day.morningActivity.name} — {day.morningActivity.description}
                      </p>
                      <p><em>Accessibility:</em> {day.morningActivity.accessibilityNote}</p>
                      <p>
                        <strong>Afternoon:</strong> {day.afternoonActivity.name} — {day.afternoonActivity.description}
                      </p>
                      <p><em>Accessibility:</em> {day.afternoonActivity.accessibilityNote}</p>
                      <p><strong>Evening:</strong> {day.eveningSuggestion}</p>
                      {!fullItineraryUnlocked && currentItinerary && index === 1 && (
                        <div className="mt-2 p-2 bg-gray-100 rounded">
                          <p className="italic text-gray-600">Unlock the full itinerary to see the remaining days.</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {!fullItineraryUnlocked && currentItinerary && (
                    <button
                      onClick={handleUnlockItinerary}
                      className="mt-2 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors duration-300"
                    >
                      Unlock Full Itinerary & Download PDF
                    </button>
                  )}
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          ))}
          {isLoading && <LoadingSpinner />}
        </div>
      </main>
    </div>
  );
};

export default TripPlanner;
