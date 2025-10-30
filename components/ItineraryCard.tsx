import React from 'react';
import type { Itinerary, DailyPlan, Activity } from '../types';

const AccessibilityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 text-teal-700 flex-shrink-0">
        <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2Z" />
        <path fillRule="evenodd" d="M10.205 8.795a.75.75 0 0 0-1.06 1.06l1.748 1.747a.75.75 0 0 1-.322 1.25l-2.002.501a.75.75 0 0 0-.547.923l1.198 3.593a.75.75 0 0 0 1.402-.468l-1.042-3.125 1.558-.39a2.25 2.25 0 0 0 1.956-2.454l-1.49-4.469a.75.75 0 0 0-1.402.468l1.042 3.125-1.558.39a.75.75 0 0 1-1.06-1.06l1.748-1.747Zm-.566-3.61a2.5 2.5 0 1 0-3.278 3.279 2.5 2.5 0 0 0 3.278-3.279Z" clipRule="evenodd" />
        <path d="M13.25 5.25a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
    </svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-stone-500 mb-2">
      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
    </svg>
);


const ActivityCard: React.FC<{ activity: Activity, timeOfDay: string }> = ({ activity, timeOfDay }) => (
    <div className="mt-3">
        <h4 className="font-semibold text-lg text-stone-700">{timeOfDay}: {activity.name}</h4>
        <p className="mt-1 text-stone-600">{activity.description}</p>
        <div className="mt-2 flex items-start p-3 bg-teal-50 border border-teal-200 rounded-lg">
            <AccessibilityIcon />
            <p className="text-sm text-teal-800 font-medium">{activity.accessibilityNote}</p>
        </div>
    </div>
);

const DayCard: React.FC<{ plan: DailyPlan }> = ({ plan }) => (
    <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-sm">
        <h3 className="text-xl font-bold text-teal-800">Day {plan.day}: {plan.title}</h3>
        <ActivityCard activity={plan.morningActivity} timeOfDay="Morning" />
        <ActivityCard activity={plan.afternoonActivity} timeOfDay="Afternoon" />
        <div className="mt-4">
            <h4 className="font-semibold text-lg text-stone-700">Evening Suggestion</h4>
            <p className="mt-1 text-stone-600">{plan.eveningSuggestion}</p>
        </div>
    </div>
);

const BlurredDayCard: React.FC<{ plan: DailyPlan }> = ({ plan }) => (
    <div className="relative p-4 bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
        <div className="filter blur-md select-none pointer-events-none opacity-60">
             <h3 className="text-xl font-bold text-teal-800">Day {plan.day}: {plan.title}</h3>
            <ActivityCard activity={plan.morningActivity} timeOfDay="Morning" />
            <ActivityCard activity={plan.afternoonActivity} timeOfDay="Afternoon" />
        </div>
        <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center text-center p-4">
            <LockIcon />
            <h3 className="text-lg font-bold text-stone-700">Day {plan.day} is Locked</h3>
            <p className="text-sm text-stone-600">Unlock the full plan to see the details.</p>
        </div>
    </div>
);

const CtaCard: React.FC = () => (
    <div className="mt-8 p-6 bg-gradient-to-br from-teal-50 to-emerald-50 border-t-4 border-teal-600 rounded-lg text-center shadow-md">
        <h3 className="text-2xl font-bold text-teal-900">Like this plan?</h3>
        <p className="mt-2 text-stone-700 max-w-lg mx-auto">Unlock the complete day-by-day itinerary and get a printer-friendly PDF to take with you on your trip.</p>
        <button 
            onClick={() => alert("Redirecting to purchase page...")}
            className="mt-4 px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            aria-label="Unlock Full Itinerary and Get PDF"
        >
            Unlock Full Itinerary & Get PDF
        </button>
    </div>
);

const ItineraryCard: React.FC<{ itinerary: Itinerary }> = ({ itinerary }) => {
  const totalDays = itinerary.dailyPlan.length;
  // If the trip is 3 days or less, show 1 day. Otherwise, show 2.
  const visibleDayCount = totalDays <= 3 ? 1 : 2;

  const visibleDays = itinerary.dailyPlan.slice(0, visibleDayCount);
  const hiddenDays = itinerary.dailyPlan.slice(visibleDayCount);

  return (
    <div className="space-y-4">
      <header className="text-center">
        <h2 className="text-3xl font-bold text-teal-900">{itinerary.tripTitle}</h2>
        <p className="mt-2 text-lg text-stone-600 max-w-2xl mx-auto">{itinerary.summary}</p>
      </header>
      <div className="space-y-6 pt-4">
        {visibleDays.map((plan) => (
          <DayCard key={plan.day} plan={plan} />
        ))}
        {hiddenDays.map((plan) => (
            <BlurredDayCard key={plan.day} plan={plan} />
        ))}
      </div>

      {hiddenDays.length > 0 && <CtaCard />}
    </div>
  );
};

export default ItineraryCard;