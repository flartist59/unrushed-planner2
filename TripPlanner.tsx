import React from 'react';
import { GoogleGenAI, Type } from "@google/genai";

// Environment variables (set in Vercel)
const AI_KEY = import.meta.env.VITE_API_KEY;
const VIATOR_AFFILIATE_ID = import.meta.env.VITE_VIATOR_ID;   // e.g., "12345"
const EXPEDIA_AFFILIATE_ID = import.meta.env.VITE_EXPEDIA_ID; // e.g., "1110l14866"

// Initialize AI
const ai = new GoogleGenAI({ apiKey: AI_KEY });

interface Trip {
  day: number;
  title: string;
  description: string;
  location?: string;
}

// Example itinerary data
const sampleItinerary: Trip[] = [
  { day: 1, title: "Arrival in Bari", description: "Settle into your hotel and enjoy the coastline." },
  { day: 2, title: "Polignano a Mare Stroll", description: "Explore the historic town and enjoy local gelato." },
];

export default function TripPlanner() {

  // Helper functions to generate affiliate links
  const getViatorLink = (activity: string) => {
    const q = encodeURIComponent(activity);
    return `https://www.viator.com/searchResults/all?affiliateId=${VIATOR_AFFILIATE_ID}&q=${q}`;
  };

  const getExpediaLink = (destination: string) => {
    const q = encodeURIComponent(destination);
    return `https://www.expedia.com/Hotel-Search?destination=${q}&affiliateId=${EXPEDIA_AFFILIATE_ID}`;
  };

  return (
    <div className="p-6 bg-stone-50 rounded-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Trip Planner</h2>

      {sampleItinerary.map((trip) => (
        <div key={trip.day} className="mb-6 p-4 bg-white border border-stone-200 rounded-2xl">
          <h3 className="font-semibold text-lg">Day {trip.day}: {trip.title}</h3>
          <p className="text-stone-700 my-2">{trip.description}</p>

          {trip.location && (
            <div className="flex gap-2 mt-2">
              <a
                href={getViatorLink(trip.location)}
                target="_blank"
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Viator Activities
              </a>
              <a
                href={getExpediaLink(trip.location)}
                target="_blank"
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Expedia Hotels
              </a>
            </div>
          )}
        </div>
      ))}

    </div>
  );
}
