import React, { useState, useEffect } from 'react';
import SearchTrips from './SearchTrips';

function PassengerDashboard() {
  const [upcomingRides] = useState([]);
  const [pastRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch passenger's upcoming and past rides from backend/Firebase
    // Acceptance Criteria: Passenger can view a list of their confirmed upcoming trips
    // Acceptance Criteria: Passenger can view a history of their past trips
    const fetchPassengerData = async () => {
      setLoading(true);
      try {
        // Mock fetch calls
        // const upcoming = await api.get('/trips/upcoming');
        // const past = await api.get('/trips/past');
        
        // setUpcomingRides(upcoming.data);
        // setPastRides(past.data);
      } catch (error) {
        console.error("Error fetching passenger dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPassengerData();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1>Passenger Dashboard</h1>
        <p>Welcome back! Manage your upcoming rides or find a new trip to campus.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Left Column: Search & Action Area */}
        <section>
          <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
            {/* Embed the SearchTrips component directly or use a Link to navigate to it */}
            <SearchTrips />
          </div>
        </section>

        {/* Right Column: Bookings Area */}
        <section>
          {loading ? (
            <p>Loading your rides...</p>
          ) : (
            <>
              {/* Upcoming Rides */}
              <div style={{ marginBottom: '30px' }}>
                <h2>Upcoming Rides</h2>
                {upcomingRides.length === 0 ? (
                  <p style={{ color: '#666' }}>You have no upcoming rides booked.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {upcomingRides.map(ride => (
                      <li key={ride.id} style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px', marginBottom: '10px' }}>
                        {/* TODO: Create an UpcomingRideCard component */}
                        <strong>{ride.destination}</strong> - {ride.date}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Past Rides */}
              <div>
                <h2>Ride History</h2>
                {pastRides.length === 0 ? (
                  <p style={{ color: '#666' }}>You have no past rides.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {pastRides.map(ride => (
                      <li key={ride.id} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '5px', marginBottom: '10px' }}>
                        {/* TODO: Create a PastRideCard component */}
                        <strong>{ride.destination}</strong> - {ride.date}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default PassengerDashboard;
