import React, { useState } from "react";
import { GoogleGenAI, Type } from "@google/genai";

// Pull in your environment variables
const API_KEY = import.meta.env.VITE_API_KEY;
const VIATOR_AFFILIATE_ID = import.meta.env.VITE_VIATOR_ID;
const EXPEDIA_AFFILIATE_ID = import.meta.env.VITE_EXPEDIA_ID;

const ai = new GoogleGenAI({ apiKey: API_KEY });

interface Activity {
  day: number;
  title: string;
  description: string;
  viatorId?: string; // Optional ID for Viator activity
  expediaId?: string; // Optional ID for Expedia hotel
}

export default function TripPlanner() {
  const [destination, setDestination] = useState("");
  const [itinerary, setItinerary] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFull, setShowFull] =
