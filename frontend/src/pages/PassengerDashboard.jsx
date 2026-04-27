import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { auth, db, firebaseReady } from '../firebase';
import { FIRESTORE_COLLECTIONS, NOTIFICATION_STATUS } from '../firestoreModel';
import SearchTrips from './SearchTrips';

function PassengerDashboard() {
  const [upcomingRides] = useState([]);
  const [pastRides] = useState([]);
  const [notifications, setNotifications] = useState([]);
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

  useEffect(() => {
    if (!firebaseReady || !auth || !db || !auth.currentUser) {
      return undefined;
    }

    const notificationsQuery = query(
      collection(db, FIRESTORE_COLLECTIONS.notifications),
      where('recipientId', '==', auth.currentUser.uid),
      where('status', '==', NOTIFICATION_STATUS.unread),
    );

    return onSnapshot(notificationsQuery, (snapshot) => {
      const notificationDocs = snapshot.docs
        .map((notificationDoc) => ({ id: notificationDoc.id, ...notificationDoc.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setNotifications(notificationDocs);
    });
  }, []);

  const handleDismissNotification = async (notificationId) => {
    if (!firebaseReady || !db) {
      setNotifications((currentNotifications) =>
        currentNotifications.filter((notification) => notification.id !== notificationId),
      );
      return;
    }

    await updateDoc(doc(db, FIRESTORE_COLLECTIONS.notifications, notificationId), {
      status: NOTIFICATION_STATUS.read,
      readAt: new Date().toISOString(),
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1>Passenger Dashboard</h1>
        <p>Welcome back! Manage your upcoming rides or find a new trip to campus.</p>
      </header>

      {notifications.length > 0 && (
        <section style={{ display: 'grid', gap: '10px', marginBottom: '24px' }}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              role="status"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                color: '#991b1b',
                fontWeight: 700,
              }}
            >
              <span>{notification.message || 'Your ride request update is ready.'}</span>
              <button
                type="button"
                onClick={() => handleDismissNotification(notification.id)}
                style={{
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  background: '#fff',
                  color: '#991b1b',
                  cursor: 'pointer',
                  fontWeight: 700,
                  padding: '8px 10px',
                  whiteSpace: 'nowrap',
                }}
              >
                Mark read
              </button>
            </div>
          ))}
        </section>
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
