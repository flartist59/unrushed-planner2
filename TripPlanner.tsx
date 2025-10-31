const [itinerary, setItinerary] = useState<Activity[]>([]);
const [loading, setLoading] = useState(false);
const [showFull, setShowFull] = useState(false);

return (
  <div className="p-4">
    <h2 className="text-xl font-bold mb-2">Your Trip Planner</h2>

    <input
      type="text"
      placeholder="Enter destination..."
      value={destination}
      onChange={(e) => setDestination(e.target.value)}
      className="border p-2 mb-4 w-full"
    />

    <button
      onClick={async () => {
        setLoading(true);
        // call AI API here
        setLoading(false);
      }}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Generate Itinerary
    </button>

    <div className="mt-4">
      {itinerary.slice(0, showFull ? itinerary.length : 2).map((day) => (
        <div key={day.day} className="mb-2">
          <strong>Day {day.day}: {day.title}</strong>
          <p>{day.description}</p>
          {day.viatorId && (
            <a
              href={`https://www.viator.com/tours/.../${day.viatorId}?partner=${VIATOR_AFFILIATE_ID}`}
              target="_blank"
              className="text-blue-600 underline mr-2"
            >
              Book Activity
            </a>
          )}
          {day.expediaId && (
            <a
              href={`https://www.expedia.com/Hotel-Name-Hotel.${day.expediaId}?affcid=${EXPEDIA_AFFILIATE_ID}`}
              target="_blank"
              className="text-blue-600 underline"
            >
              Book Hotel
            </a>
          )}
        </div>
      ))}
    </div>
  </div>
);
