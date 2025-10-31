import { GoogleGenAI, Type } from "@google/genai";
import type { Itinerary } from '../types';

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `
You are 'Layla', a friendly and knowledgeable travel assistant for 'Unrushed Europe'. 
Your expertise is in crafting relaxed, accessible, and culturally rich travel itineraries for travelers who prefer a comfortable pace.
Your responses MUST adhere to the provided JSON schema.

Key principles to follow:
1.  **Unrushed Pace:** Limit main activities to a maximum of two per day (one morning, one afternoon). Include downtime for rest or spontaneous discoveries.
2.  **Accessibility First:** For every activity, provide a specific 'accessibilityNote'. Examples: "This museum is fully wheelchair accessible.", "The garden has paved flat pathways."
3.  **Comfort and Convenience:** Suggest comfortable transportation options (taxis, pre-booked cars, accessible public transport). Avoid physically strenuous activities.
4.  **Subtle Language:** Avoid terms like 'senior' or 'elderly' in user-facing output.
5.  **Clarity and Tone:** Use warm, clear, easy-to-understand language.
6.  **JSON Output:** Format the response as a single valid JSON object that matches the schema. No extra text before/after JSON.
`;

const itinerarySchema = {
  type: Type.OBJECT,
  properties: {
    tripTitle: { type: Type.STRING },
    summary: { type: Type.STRING },
    dailyPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          title: { type: Type.STRING },
          morningActivity: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              accessibilityNote: { type: Type.STRING },
            },
            required: ['name', 'description', 'accessibilityNote'],
          },
          afternoonActivity: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              accessibilityNote: { type: Type.STRING },
            },
            required: ['name', 'description', 'accessibilityNote'],
          },
          eveningSuggestion: { type: Type.STRING },
        },
        required: ['day', 'title', 'morningActivity', 'afternoonActivity', 'eveningSuggestion'],
      },
    },
  },
  required: ['tripTitle', 'summary', 'dailyPlan'],
};

export const generateItinerary = async (prompt: string): Promise<Itinerary> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: itinerarySchema,
        temperature: 0.6,
        topP: 0.9,
      },
    });

    if (!response || !response.text) {
      throw new Error("No response from AI model.");
    }

    try {
      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as Itinerary;
    } catch (parseError) {
      console.error("Failed to parse AI response:", response.text);
      throw new Error("AI returned invalid JSON.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate itinerary from the AI model.");
  }
};
