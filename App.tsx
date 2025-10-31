import React from 'react';
import TripPlanner from "./TripPlanner";

export default function App() {
  return (
    // The outer container has been simplified for seamless embedding.
    // h-full ensures the component fills the height of the iframe it will be placed in.
    // The background is set to bg-stone-50 to match the planner's main background.
    <div className="h-full bg-stone-50">
      <TripPlanner />
    </div>
  );
}
