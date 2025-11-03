export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string | Itinerary;
}

export interface Activity {
  name: string;
  description: string;
  accessibilityNote: string;
  estimatedCost?: string;
  duration?: string;
}

export interface DailyPlan {
  day: number;
  title: string;
  morningActivity: Activity;
  afternoonActivity: Activity;
  eveningSuggestion: string;
  restaurantRecommendations?: string[];
  transportationTips?: string;
}

export interface Itinerary {
  tripTitle: string;
  summary: string;
  dailyPlan: DailyPlan[];
  estimatedTotalCost?: string;
  packingTips?: string[];
}

export interface PlanDetails {
  destination: string;
  tripLength: string;
  travelPace: string;
  numberOfTravelers: number;
  interests: string[];
  season: string;
  budgetLevel: string;
}