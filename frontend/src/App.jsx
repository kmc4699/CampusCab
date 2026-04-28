import React, { useState } from 'react';
import Login from './Login';
import VehicleProfile from './VehicleProfile';
import CreateTrip from './CreateTrip';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [user, setUser] = useState(null); // { role: 'Admin' | 'Driver' | 'Passenger', ... }

  const handleLoginSuccess = (userInfo) => {
    // userInfo should include at least { role }
    // For backwards compatibility, accept a plain true or an object
    if (userInfo === true) {
      setUser({ role: 'Passenger' });
    } else {
      setUser(userInfo);
    }
  };

  const handleLogout = () => setUser(null);

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  if (user.role === 'Admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', width: '400px' }}>
        <h2>CampusCab Dashboard</h2>
        <p style={{ color: '#555' }}>Welcome! You are securely logged in.</p>
        <VehicleProfile />
        <CreateTrip />
        <button
          onClick={handleLogout}
          style={{ padding: '10px 20px', marginTop: '30px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', width: '100%' }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

export default App;
