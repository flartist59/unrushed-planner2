// App.tsx
import React from 'react';

function App() {
  const { user, signOut, loading } = useAuth(); // Use the auth context

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading authentication...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Unrushed Europe Planner</h1>
      </header>

      {user ? (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <p>Welcome, {user.email}!</p>
          <button onClick={signOut} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Sign Out
          </button>
          <p style={{ marginTop: '20px' }}>
            You are now logged in and have access to premium features (once implemented)!
          </p>
          {/* Here you would render your actual planner or a dashboard for logged-in users */}
          <p>This is where your full planner experience will be.</p>
        </div>
      ) : (
        <>
          <p style={{ textAlign: 'center', marginTop: '30px' }}>
            Sign in or create an account to save and manage your itineraries.
          </p>
          <AuthForm /> {/* Display the AuthForm if no user is logged in */}
        </>
      )}
    </div>
  );
}

export default App;