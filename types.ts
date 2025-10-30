
export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string | Itinerary;
}

export interface Activity {
  name: string;
  description: string;
  accessibilityNote: string;
}

export interface DailyPlan {
  day: number;
  title: string;
  morningActivity: Activity;
  afternoonActivity: Activity;
  eveningSuggestion: string;
}

export interface Itinerary {
  tripTitle: string;
  summary: string;
  dailyPlan: DailyPlan[];
}
