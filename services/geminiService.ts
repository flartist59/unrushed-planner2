import { GoogleGenAI, Type } from "@google/genai";
import type { Itinerary } from '../types';

const API_KEY = import.meta.env.VITE_API_KEY;


if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `
You are 'Layla', a friendly and knowledgeable travel assistant for 'Unrushed Europe'. 
Your expertise is in crafting relaxed, accessible, and culturally rich travel itineraries for travelers who prefer a comfortable pace.
Your responses MUST adhere to the provided JSON schema.

Key principles to follow:
1.  **Unrushed Pace:** Itineraries should be leisurely. Limit main activities to a maximum of two per day (one in the morning, one in the afternoon). Include plenty of downtime for rest or spontaneous discoveries.
2.  **Accessibility First:** For every activity, provide a specific and helpful 'accessibilityNote'. Examples: "This museum is fully wheelchair accessible with elevators to all floors.", "The garden has paved, flat pathways suitable for walkers.", "A short taxi ride is recommended to reach the entrance."
3.  **Comfort and Convenience:** Suggest comfortable transportation options (e.g., taxis, pre-booked cars, accessible public transport). Recommend activities that are not physically strenuous.
4.  **Subtle Language:** While the plan is designed for comfort and accessibility, avoid using words like 'senior', 'elderly', or 'older travelers' in the user-facing output (like the tripTitle, summary, and daily descriptions). The tone should be about 'unrushed', 'accessible', and 'comfortable' travel that appeals to a wide audience.
5.  **Clarity and Tone:** Use a warm, reassuring, and clear tone. Avoid jargon. Present information in an easy-to-understand manner.
6.  **JSON Output:** You MUST format your entire response as a single, valid JSON object that matches the provided schema. Do not include any text, pleasantries, or markdown formatting before or after the JSON object.
`;

const itinerarySchema = {
  type: Type.OBJECT,
  properties: {
    tripTitle: { type: Type.STRING, description: 'A catchy and descriptive title for the trip.' },
    summary: { type: Type.STRING, description: 'A brief, engaging summary of the overall trip experience.' },
    dailyPlan: {
      type: Type.ARRAY,
      description: 'An array of daily plans for the trip.',
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER, description: 'The day number of the itinerary (e.g., 1, 2, 3).' },
          title: { type: Type.STRING, description: 'A short, thematic title for the day (e.g., "Arrival and Riverside Charm").' },
          morningActivity: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              accessibilityNote: { type: Type.STRING, description: 'Crucial details on accessibility for seniors.' },
            },
            required: ['name', 'description', 'accessibilityNote'],
          },
          afternoonActivity: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              accessibilityNote: { type: Type.STRING, description: 'Crucial details on accessibility for seniors.' },
            },
            required: ['name', 'description', 'accessibilityNote'],
          },
          eveningSuggestion: { type: Type.STRING, description: 'A relaxed suggestion for the evening, like a quiet dinner or a scenic view.' },
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
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: itinerarySchema,
        temperature: 0.6,
        topP: 0.9,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as Itinerary;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate itinerary from the AI model.");
  }
};
