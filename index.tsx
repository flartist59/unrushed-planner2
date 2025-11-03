// index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // This is your main App component
import './index.css'; // Your global CSS imports
import { AuthProvider } from './AuthContext'; // Import AuthProvider (path relative to index.tsx)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider> {/* Wrap your App with AuthProvider */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
);