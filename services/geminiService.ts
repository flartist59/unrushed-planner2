import { GoogleGenAI, Type } from "@google/genai";
import type { Itinerary, PlanDetails } from "../types";

const API_KEY = import.meta.env.VITE_API_KEY;
if (!API_KEY) {
  throw new Error("VITE_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `
You are 'Layla', a friendly and knowledgeable travel assistant for 'Unrushed Europe'. 
Your expertise is in crafting relaxed, accessible, and culturally rich travel itineraries for travelers who prefer a comfortable, unhurried pace.

Your responses MUST adhere to the provided JSON schema.

Key principles:
1. **Unrushed pace**: Maximum 2-3 main activities per day with plenty of downtime and flexibility.
2. **Accessibility**: Include an 'accessibilityNote' for each activity (wheelchair access, stairs, walking distance, etc.).
3. **Comfort**: Recommend easy transport options, avoid overly strenuous activities.
4. **Personalization**: Tailor recommendations based on interests, season, budget, and group size.
5. **Detail**: Provide rich, specific descriptions with insider tips and local favorites.
6. **Practicality**: Include estimated costs, durations, and transportation details.
7. **Subtle Language**: No terms like 'senior' or 'elderly' - focus on comfort and quality.
8. **Clarity**: Warm, clear, easy-to-read descriptions.
9. **Multi-city handling**: If user specifies multiple cities with day counts (e.g., "5 days Paris, 3 days Rome"), respect those allocations exactly.
10. **JSON Output**: Return a single valid JSON object that matches the schema perfectly.

When creating itineraries:
- For morning activities: suggest 9am-12pm timeframe
- For afternoon activities: suggest 2pm-5pm timeframe  
- Evening suggestions should be relaxed (dinner spots, light walks, cultural performances)
- Include 2-3 restaurant recommendations per city
- Mention seasonal considerations (weather, crowds, special events)
- Provide budget-appropriate suggestions
- Include transportation tips between activities and cities
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
              estimatedCost: { type: Type.STRING },
              duration: { type: Type.STRING },
            },
            required: ["name", "description", "accessibilityNote"],
          },
          afternoonActivity: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              accessibilityNote: { type: Type.STRING },
              estimatedCost: { type: Type.STRING },
              duration: { type: Type.STRING },
            },
            required: ["name", "description", "accessibilityNote"],
          },
          eveningSuggestion: { type: Type.STRING },
          restaurantRecommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          transportationTips: { type: Type.STRING },
        },
        required: ["day", "title", "morningActivity", "afternoonActivity", "eveningSuggestion"],
      },
    },
    estimatedTotalCost: { type: Type.STRING },
    packingTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["tripTitle", "summary", "dailyPlan"],
};

const buildDetailedPrompt = (details: PlanDetails): string => {
  const {
    destination,
    tripLength,
    travelPace,
    numberOfTravelers,
    interests,
    season,
    budgetLevel,
  } = details;

  const interestsText = interests.length > 0 
    ? `Special interests: ${interests.join(', ')}` 
    : '';

  return `
Create a detailed ${tripLength} itinerary for ${numberOfTravelers} traveler${numberOfTravelers > 1 ? 's' : ''} visiting ${destination}.

**Trip Details:**
- Duration: ${tripLength}
- Travel Pace: ${travelPace}
- Season: ${season}
- Budget Level: ${budgetLevel}
- Number of Travelers: ${numberOfTravelers}
${interestsText ? `- ${interestsText}` : ''}

**Important Instructions:**
1. If the destination includes multiple cities with specific day counts (e.g., "5 days Paris, 3 days Rome"), allocate exactly that many days to each city in order.
2. Provide very detailed, rich descriptions for each activity (at least 3-4 sentences).
3. Include specific venue names, addresses when helpful, and insider tips.
4. Tailor all recommendations to the ${season} season (mention weather, seasonal events, what to expect).
5. Match the ${budgetLevel} budget level (suggest appropriate restaurants, hotels, activities).
6. Incorporate the travelers' interests: ${interests.join(', ') || 'general sightseeing'}.
7. For each day, include 2-3 specific restaurant recommendations with cuisine type and price range.
8. Provide practical transportation tips between activities and cities.
9. Include estimated costs for major activities and meals.
10. Suggest 5-10 season-appropriate packing tips at the end.
11. Calculate and provide an estimated total cost for the trip (activities, meals, local transport).

**Activity Guidelines:**
- Morning activities: 9am-12pm, include coffee/breakfast spots
- Afternoon activities: 2pm-5pm, allow time for lunch
- Evening: Relaxed suggestions (nice restaurants, sunset spots, light cultural activities)
- Always note accessibility (elevator access, stairs, walking distance, rest areas)
- Keep the pace ${travelPace.toLowerCase()} - not rushed, plenty of breaks

Make this itinerary feel personal, thoughtful, and exciting while being practical and comfortable.
`.trim();
};

export const generateItinerary = async (details: PlanDetails): Promise<Itinerary> => {
  try {
    const prompt = buildDetailedPrompt(details);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: itinerarySchema,
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 8192, // Allow longer responses for detailed itineraries
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