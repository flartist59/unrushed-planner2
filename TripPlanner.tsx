import React, { useState } from 'react';
import { generateItinerary } from './services/geminiService';
import type { Itinerary } from './types';
import jsPDF from 'jspdf';

interface PlanDetails {
  destination: string;
  tripLength: string;
  travelPace: string;
}

const TripPlanner: React.FC = () => {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [form, setForm] = useState<PlanDetails>({
    destination: '',
    tripLength: '3 days',
    travelPace: 'Relaxed',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlanTrip = async () => {
    setLoading(true);
    setError(null);
    setUnlocked(false);
    try {
      const result = await generateItinerary(
        `A ${form.tripLength} trip to ${form.destination} with a ${form.travelPace.toLowerCase()} pace.`
      );
      setItinerary(result);
    } catch (err) {
      setError('Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!itinerary) return;
    try {
      const pdf = new jsPDF();
      pdf.text(JSON.stringify(itinerary, null, 2), 10, 10);
      const pdfBlob = pdf.output('blob');

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBlob }),
      });
      const data = await res.json();
      if (data.id) {
        const stripe = (window as any).Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
        await stripe.redirectToCheckout({ sessionId: data.id });
      }
    } catch (err) {
      console.error(err);
      alert('Error creating checkout session.');
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Unrushed Europe Trip Planner</h1>
      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          name="destination"
          placeholder="Destination"
          value={form.destination}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <select name="tripLength" value={form.tripLength} onChange={handleChange} className="border p-2 rounded">
          <option>1 day</option>
          <option>2 days</option>
          <option>3 days</option>
          <option>4 days</option>
          <option>5 days</option>
        </select>
        <select name="travelPace" value={form.travelPace} onChange={handleChange} className="border p-2 rounded">
          <option>Relaxed</option>
          <option>Moderate</option>
          <option>Fast-paced</option>
        </select>
        <button onClick={handlePlanTrip} className="bg-teal-600 text-white px-4 py-2 rounded">
          {loading ? 'Planning...' : 'Plan My Trip'}
        </button>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      {itinerary && (
        <div className="border p-4 rounded">
          <h2 className="text-xl font-bold mb-2">{itinerary.tripTitle}</h2>
          <p className="mb-2">{itinerary.summary}</p>
          {itinerary.dailyPlan.map((day) => (
            <div key={day.day} className="mb-3">
              <h3 className="font-semibold">
                Day {day.day}: {day.title}
              </h3>
              <div className={unlocked ? '' : 'blur-sm'}>
                <p>
                  <strong>Morning:</strong> {day.morningActivity.name} - {day.morningActivity.description}
                </p>
                <p>
                  <strong>Afternoon:</strong> {day.afternoonActivity.name} - {day.afternoonActivity.description}
                </p>
                <p>
                  <strong>Evening Suggestion:</strong> {day.eveningSuggestion}
                </p>
              </div>
            </div>
          ))}
          {!unlocked && (
            <button
              onClick={handleUnlock}
              className="bg-teal-700 text-white px-4 py-2 rounded mt-2"
            >
              Unlock Full Itinerary & PDF
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TripPlanner;
