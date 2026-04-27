import React, { useState, useEffect } from 'react';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db, firebaseReady } from '../firebase';
import { FIRESTORE_COLLECTIONS, RIDE_REQUEST_STATUS } from '../firestoreModel';
import SearchTrips from './SearchTrips';

function formatDeparture(departureTime) {
  if (!departureTime) return 'Departure time unavailable';
  return new Date(departureTime).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function PassengerDashboard() {
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [pastRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!firebaseReady || !auth || !db) {
      setUpcomingRides([]);
      setLoading(false);
      return undefined;
    }

    const user = auth.currentUser;
    if (!user) {
      setUpcomingRides([]);
      setLoading(false);
      return undefined;
    }

    const approvedRequestsQuery = query(
      collection(db, FIRESTORE_COLLECTIONS.rideRequests),
      where('passengerId', '==', user.uid),
      where('status', '==', RIDE_REQUEST_STATUS.approved),
    );

    setLoading(true);

    return onSnapshot(
      approvedRequestsQuery,
      async (snapshot) => {
        try {
          const rideDocs = await Promise.all(
            snapshot.docs.map(async (requestDoc) => {
              const request = { id: requestDoc.id, ...requestDoc.data() };
              const tripSnap = request.tripId
                ? await getDoc(doc(db, FIRESTORE_COLLECTIONS.trips, request.tripId))
                : null;
              const trip = tripSnap?.exists() ? { id: tripSnap.id, ...tripSnap.data() } : null;
              return { ...request, trip };
            }),
          );

          const sortedRides = rideDocs.sort((a, b) =>
            (a.trip?.departureTime || '').localeCompare(b.trip?.departureTime || ''),
          );
          setUpcomingRides(sortedRides);
          setMessage('');
        } catch (error) {
          setMessage(error.message || 'Unable to load upcoming rides.');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setMessage(error.message || 'Unable to load upcoming rides.');
        setLoading(false);
      },
    );
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1>Passenger Dashboard</h1>
        <p>Welcome back! Manage your upcoming rides or find a new trip to campus.</p>
      </header>

      {message && (
        <p
          style={{
            padding: '10px 12px',
            borderRadius: '8px',
            backgroundColor: message.startsWith('Error') ? '#fef2f2' : '#ecfdf5',
            color: message.startsWith('Error') ? '#991b1b' : '#047857',
            fontWeight: 700,
          }}
        >
          {message}
        </p>
      )}

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
                    {upcomingRides.map((ride) => (
                      <li
                        key={ride.id}
                        style={{
                          padding: '15px',
                          border: '1px solid #ccc',
                          borderRadius: '5px',
                          marginBottom: '10px',
                        }}
                      >
                        <strong>{ride.trip?.destination || 'Unknown destination'}</strong>
                        <div style={{ color: '#555', marginTop: '6px' }}>
                          {ride.trip?.origin || 'Unknown origin'} to {ride.trip?.destination || 'Unknown destination'}
                        </div>
                        <div style={{ color: '#555', marginTop: '6px' }}>
                          {formatDeparture(ride.trip?.departureTime)}
                        </div>
                        <div style={{ color: '#555', marginTop: '6px' }}>
                          {ride.seatsRequested || 1} seat(s) reserved
                        </div>
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
