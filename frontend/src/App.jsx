import React, { useState } from 'react';
import Login from './Login';
import VehicleProfile from './VehicleProfile'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', width: '400px' }}>
          <h2>CampusCab Dashboard</h2>
          <p style={{ color: '#555' }}>Welcome! You are securely logged in.</p>
          
          {/* We added the Vehicle Profile feature right here */}
          <VehicleProfile />

          <button 
            onClick={() => setIsAuthenticated(false)} 
            style={{ padding: '10px 20px', marginTop: '30px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', width: '100%' }}
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Login onLoginSuccess={() => setIsAuthenticated(true)} />
    </div>
  );
}

export default App;
