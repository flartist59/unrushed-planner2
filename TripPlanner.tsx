import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";

// Environment variables
const API_KEY = import.meta.env.VITE_API_KEY;
const VIATOR_AFFILIATE_ID = import.meta.env.VITE_VIATOR_ID;
const EXPEDIA_AFFILIATE_ID = import.meta.env.VITE_EXPEDIA_ID;

const ai = new GoogleGenAI({ apiKey: API_KEY });

interface Activity {
  day: number;
  title: string;
  description: string;
  viatorId?: string;
  expediaId?: string;
}

export default function TripPlanner() {
  const [destination, setDestination] = useState("");
  const [itinerary, setItinerary] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFull, setShowFull] = useState(false);

  const generateItinerary = async () => {
    setLoading(true);
    try {
      const response = await ai.generate({
        model: "text-bison-001",
        prompt: `Create a gentle-paced 7-day itinerary for ${destination}. Include suggested activities and hotels.`,
      });

      // Simplified parsing: assuming AI returns JSON array of activities
      const activities: Activity[] = JSON.parse(response.text || "[]");
      setItinerary(activities
