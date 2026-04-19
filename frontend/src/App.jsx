import React, { useState } from 'react';
import Login from './Login';

function App() {
  // This state tracks if the user is logged in
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // If they are logged in, show the Dashboard
  if (isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>🚗 CampusCab Dashboard</h1>
        <p>Welcome! You are securely logged in and verified.</p>
        <button 
          onClick={() => setIsAuthenticated(false)} 
          style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}
        >
          Log Out
        </button>
      </div>
    );
  }

  // If they are not logged in, show the Login screen
  return (
    <div>
      {/* We pass a function down to Login.jsx so it can tell App.jsx when login succeeds */}
      <Login onLoginSuccess={() => setIsAuthenticated(true)} />
    </div>
  );
}

export default App;
