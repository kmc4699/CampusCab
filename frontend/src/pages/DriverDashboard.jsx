import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, query, runTransaction, where } from 'firebase/firestore';
import { auth, db, firebaseReady } from '../firebase';

const panelStyle = {
  marginTop: '30px',
  padding: '20px',
  border: '1px solid #d7deea',
  borderRadius: '12px',
  backgroundColor: '#fafcff',
  textAlign: 'left',
};

const cardStyle = {
  padding: '16px',
  border: '1px solid #d9e3f2',
  borderRadius: '10px',
  backgroundColor: '#ffffff',
  boxShadow: '0 6px 18px rgba(15, 23, 42, 0.06)',
};

function DriverDashboard() {
  const [trips, setTrips] = useState([]);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [busyRequestId, setBusyRequestId] = useState('');

  useEffect(() => {
    if (!firebaseReady || !auth || !db) {
      setTrips([
        {
          id: 'demo-trip-1',
          origin: 'North Shore',
          destination: 'City Campus',
          departureTime: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
          availableSeats: 2,
          seats: 2,
          status: 'active',
        },
      ]);
      setRequests([
        {
          id: 'demo-request-1',
          tripId: 'demo-trip-1',
          passengerName: 'Jamie Chen',
          passengerEmail: 'jamie.chen@autuni.ac.nz',
          note: 'I can meet near the main gate.',
          status: 'pending',
        },
        {
          id: 'demo-request-2',
          tripId: 'demo-trip-1',
          passengerName: 'Taylor Singh',
          passengerEmail: 'taylor.singh@autuni.ac.nz',
          note: 'Happy to chip in for parking.',
          status: 'approved',
        },
      ]);
      return undefined;
    }

    const user = auth.currentUser;
    if (!user) {
      return undefined;
    }

    const tripsQuery = query(collection(db, 'trips'), where('driverId', '==', user.uid));
    const requestsQuery = query(collection(db, 'rideRequests'), where('tripOwnerId', '==', user.uid));

    const unsubscribeTrips = onSnapshot(tripsQuery, (snapshot) => {
      const tripDocs = snapshot.docs.map((tripDoc) => ({
        id: tripDoc.id,
        ...tripDoc.data(),
      }));
      setTrips(tripDocs);
    });

    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const requestDocs = snapshot.docs.map((requestDoc) => ({
        id: requestDoc.id,
        ...requestDoc.data(),
      }));
      setRequests(requestDocs);
    });

    return () => {
      unsubscribeTrips();
      unsubscribeRequests();
    };
  }, []);

  const tripsById = useMemo(
    () =>
      trips.reduce((accumulator, trip) => {
        accumulator[trip.id] = trip;
        return accumulator;
      }, {}),
    [trips],
  );

  const pendingRequests = useMemo(
    () =>
      requests
        .filter((request) => (request.status || '').toLowerCase() === 'pending')
        .sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        }),
    [requests],
  );

  const approvedRequests = useMemo(
    () => requests.filter((request) => (request.status || '').toLowerCase() === 'approved'),
    [requests],
  );

  const handleApprove = async (requestId) => {
    const request = requests.find((item) => item.id === requestId);
    if (!request) {
      setMessage('Error: Request could not be found.');
      return;
    }

    if (!firebaseReady || !auth || !db) {
      setRequests((currentRequests) =>
        currentRequests.map((item) =>
          item.id === requestId ? { ...item, status: 'approved', decidedAt: new Date().toISOString() } : item,
        ),
      );
      setTrips((currentTrips) =>
        currentTrips.map((trip) =>
          trip.id === request.tripId
            ? {
                ...trip,
                availableSeats: Math.max(0, (trip.availableSeats ?? trip.seats ?? 0) - 1),
                status: (trip.availableSeats ?? trip.seats ?? 0) - 1 <= 0 ? 'full' : trip.status,
              }
            : trip,
        ),
      );
      setMessage('Demo mode: Passenger approved and seat count updated.');
      return;
    }

    setBusyRequestId(requestId);
    setMessage('');

    try {
      await runTransaction(db, async (transaction) => {
        const requestRef = doc(db, 'rideRequests', requestId);
        const tripRef = doc(db, 'trips', request.tripId);

        const [requestSnap, tripSnap] = await Promise.all([
          transaction.get(requestRef),
          transaction.get(tripRef),
        ]);

        if (!requestSnap.exists()) {
          throw new Error('Request not found.');
        }

        if (!tripSnap.exists()) {
          throw new Error('Trip not found.');
        }

        const latestRequest = requestSnap.data();
        const tripData = tripSnap.data();
        const currentStatus = (latestRequest.status || '').toLowerCase();

        if (currentStatus !== 'pending') {
          throw new Error('This request has already been processed.');
        }

        const currentSeats = Number.isFinite(tripData.availableSeats)
          ? tripData.availableSeats
          : tripData.seats;

        if (!Number.isFinite(currentSeats) || currentSeats <= 0) {
          throw new Error('No seats are available for this trip.');
        }

        const nextSeats = currentSeats - 1;

        transaction.update(requestRef, {
          status: 'approved',
          decidedAt: new Date().toISOString(),
        });
        transaction.update(tripRef, {
          availableSeats: nextSeats,
          status: nextSeats === 0 ? 'full' : tripData.status || 'active',
        });
      });

      setMessage('Passenger approved and seat count updated.');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setBusyRequestId('');
    }
  };

  const handleDecline = async (requestId) => {
    const request = requests.find((item) => item.id === requestId);
    if (!request) {
      setMessage('Error: Request could not be found.');
      return;
    }

    if (!firebaseReady || !auth || !db) {
      setRequests((currentRequests) =>
        currentRequests.map((item) =>
          item.id === requestId ? { ...item, status: 'declined', decidedAt: new Date().toISOString() } : item,
        ),
      );
      setMessage('Demo mode: Passenger request declined.');
      return;
    }

    setBusyRequestId(requestId);
    setMessage('');

    try {
      await runTransaction(db, async (transaction) => {
        const requestRef = doc(db, 'rideRequests', requestId);
        const requestSnap = await transaction.get(requestRef);

        if (!requestSnap.exists()) {
          throw new Error('Request not found.');
        }

        const latestRequest = requestSnap.data();
        const currentStatus = (latestRequest.status || '').toLowerCase();

        if (currentStatus !== 'pending') {
          throw new Error('This request has already been processed.');
        }

        transaction.update(requestRef, {
          status: 'declined',
          decidedAt: new Date().toISOString(),
        });
      });

      setMessage('Passenger request declined.');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setBusyRequestId('');
    }
  };

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, color: '#0f172a' }}>Driver Dashboard</h3>
          <p style={{ marginTop: '6px', color: '#52607a' }}>
            Review pending passengers before they get access to your trip.
          </p>
          {!firebaseReady && (
            <p style={{ marginTop: '8px', color: '#92400e', fontWeight: 700 }}>
              Demo mode: showing local sample requests because Firebase is not configured.
            </p>
          )}
        </div>
        <div
          style={{
            minWidth: '84px',
            padding: '10px 14px',
            borderRadius: '999px',
            backgroundColor: pendingRequests.length ? '#fee2e2' : '#dcfce7',
            color: pendingRequests.length ? '#991b1b' : '#166534',
            fontWeight: 800,
            textAlign: 'center',
          }}
        >
          {pendingRequests.length} Pending
        </div>
      </div>

      {message && (
        <p
          style={{
            marginTop: '16px',
            color: message.startsWith('Error') ? '#b91c1c' : '#166534',
            fontWeight: 700,
          }}
        >
          {message}
        </p>
      )}

      <div style={{ display: 'grid', gap: '14px', marginTop: '18px' }}>
        {pendingRequests.length === 0 ? (
          <div style={{ ...cardStyle, backgroundColor: '#f8fafc' }}>
            <strong style={{ color: '#0f172a' }}>No pending requests right now.</strong>
            <p style={{ marginTop: '6px', color: '#52607a' }}>
              New passenger requests will appear here as soon as they are created.
            </p>
          </div>
        ) : (
          pendingRequests.map((request) => {
            const trip = tripsById[request.tripId];
            const remainingSeats = Number.isFinite(trip?.availableSeats)
              ? trip.availableSeats
              : trip?.seats;
            const isBusy = busyRequestId === request.id;

            return (
              <div key={request.id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#0f172a' }}>
                      {request.passengerEmail || request.passengerName || 'Passenger request'}
                    </h4>
                    <p style={{ marginTop: '8px', color: '#52607a' }}>
                      Trip: {trip?.origin || 'Unknown origin'} to {trip?.destination || 'Unknown destination'}
                    </p>
                    <p style={{ marginTop: '4px', color: '#52607a' }}>
                      Departure: {trip?.departureTime ? new Date(trip.departureTime).toLocaleString() : 'Unknown'}
                    </p>
                    <p style={{ marginTop: '4px', color: '#2563eb', fontWeight: 700 }}>
                      Seats remaining: {remainingSeats ?? 'Unknown'}
                    </p>
                    {request.note && (
                      <p style={{ marginTop: '10px', color: '#334155' }}>
                        <strong>Passenger note:</strong> {request.note}
                      </p>
                    )}
                  </div>
                  <span
                    style={{
                      padding: '6px 10px',
                      borderRadius: '999px',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                    }}
                  >
                    {request.status}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => handleApprove(request.id)}
                    disabled={isBusy}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: isBusy ? 'wait' : 'pointer',
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      fontWeight: 800,
                    }}
                  >
                    {isBusy ? 'Working...' : 'Accept'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecline(request.id)}
                    disabled={isBusy}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      cursor: isBusy ? 'wait' : 'pointer',
                      backgroundColor: '#ffffff',
                      color: '#b91c1c',
                      fontWeight: 800,
                    }}
                  >
                    {isBusy ? 'Working...' : 'Decline'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ ...cardStyle, marginTop: '18px', backgroundColor: '#eff6ff' }}>
        <h4 style={{ margin: 0, color: '#0f172a' }}>Approved Requests</h4>
        <p style={{ marginTop: '8px', color: '#52607a' }}>
          {approvedRequests.length === 0
            ? 'Approved passengers will appear here after you accept them.'
            : `${approvedRequests.length} request(s) approved so far.`}
        </p>
      </div>
    </div>
  );
}

export default DriverDashboard;
