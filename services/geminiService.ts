import { GoogleGenAI, Type } from "@google/genai";
import type { Itinerary } from "../types";

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `
You are 'Layla', a friendly and knowledgeable travel assistant for 'Unrushed Europe'. 
Your expertise is in crafting relaxed, accessible, and culturally rich travel itineraries for travelers who prefer a comfortable pace.
Your responses MUST adhere to the provided JSON schema.

Key principles:
1. Unrushed pace: max 2 main activities per day, plenty of downtime.
2. Accessibility: include an 'accessibilityNote' for each activity.
3. Comfort: recommend easy transport, avoid strenuous activities.
4. Subtle Language: no terms like 'senior' or 'elderly'.
5. Clarity: warm, clear, easy to read.
6. JSON Output: return a single valid JSON object that matches schema.
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
            required: ["name", "description", "accessibilityNote"],
          },
          afternoonActivity: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              accessibilityNote: { type: Type.STRING },
            },
            required: ["name", "description", "accessibilityNote"],
          },
          eveningSuggestion: { type: Type.STRING },
        },
        required: ["day", "title", "morningActivity", "afternoonActivity", "eveningSuggestion"],
      },
    },
  },
  required: ["tripTitle", "summary", "dailyPlan"],
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

    if (!response?.text) throw new Error("No response from AI model");

    try {
      return JSON.parse(response.text.trim()) as Itinerary;
    } catch (parseError) {
      console.error("Failed to parse AI response:", response.text);
      throw new Error("AI returned invalid JSON.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate itinerary from AI model.");
  }
};
