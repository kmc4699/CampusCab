import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, query, runTransaction, where } from 'firebase/firestore';
import { auth, db, firebaseReady } from '../firebase';
import { FIRESTORE_COLLECTIONS, RIDE_REQUEST_STATUS, TRIP_STATUS } from '../firestoreModel';
import useIsDesktop from '../hooks/useIsDesktop';
import { buttons, colors, pills, radius, shadows, typography } from '../theme';

function DriverDashboard() {
  const [trips, setTrips] = useState([]);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [busyRequestId, setBusyRequestId] = useState('');
  const isDesktop = useIsDesktop();

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
          status: TRIP_STATUS.active,
        },
      ]);
      setRequests([
        {
          id: 'demo-request-1',
          tripId: 'demo-trip-1',
          passengerName: 'Jamie Chen',
          passengerEmail: 'jamie.chen@autuni.ac.nz',
          note: 'I can meet near the main gate.',
          status: RIDE_REQUEST_STATUS.pending,
        },
        {
          id: 'demo-request-2',
          tripId: 'demo-trip-1',
          passengerName: 'Taylor Singh',
          passengerEmail: 'taylor.singh@autuni.ac.nz',
          note: 'Happy to chip in for parking.',
          status: RIDE_REQUEST_STATUS.approved,
        },
      ]);
      return undefined;
    }

    const user = auth.currentUser;
    if (!user) return undefined;

    const tripsQuery = query(
      collection(db, FIRESTORE_COLLECTIONS.trips),
      where('driverId', '==', user.uid),
    );
    const requestsQuery = query(
      collection(db, FIRESTORE_COLLECTIONS.rideRequests),
      where('tripOwnerId', '==', user.uid),
    );

    const unsubscribeTrips = onSnapshot(tripsQuery, (snapshot) => {
      const tripDocs = snapshot.docs.map((tripDoc) => ({ id: tripDoc.id, ...tripDoc.data() }));
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
        .filter((request) => (request.status || '').toLowerCase() === RIDE_REQUEST_STATUS.pending)
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)),
    [requests],
  );

  const approvedRequests = useMemo(
    () => requests.filter((request) => (request.status || '').toLowerCase() === RIDE_REQUEST_STATUS.approved),
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
          item.id === requestId
            ? { ...item, status: RIDE_REQUEST_STATUS.approved, decidedAt: new Date().toISOString() }
            : item,
        ),
      );
      setTrips((currentTrips) =>
        currentTrips.map((trip) =>
          trip.id === request.tripId
            ? {
                ...trip,
                availableSeats: Math.max(0, (trip.availableSeats ?? trip.seats ?? 0) - 1),
                status:
                  (trip.availableSeats ?? trip.seats ?? 0) - 1 <= 0 ? TRIP_STATUS.full : trip.status,
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
        const requestRef = doc(db, FIRESTORE_COLLECTIONS.rideRequests, requestId);
        const tripRef = doc(db, FIRESTORE_COLLECTIONS.trips, request.tripId);

        const [requestSnap, tripSnap] = await Promise.all([
          transaction.get(requestRef),
          transaction.get(tripRef),
        ]);

        if (!requestSnap.exists()) throw new Error('Request not found.');
        if (!tripSnap.exists()) throw new Error('Trip not found.');

        const latestRequest = requestSnap.data();
        const tripData = tripSnap.data();
        const currentStatus = (latestRequest.status || '').toLowerCase();

        if (currentStatus !== RIDE_REQUEST_STATUS.pending) {
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
          status: RIDE_REQUEST_STATUS.approved,
          decidedAt: new Date().toISOString(),
        });
        transaction.update(tripRef, {
          availableSeats: nextSeats,
          status: nextSeats === 0 ? TRIP_STATUS.full : tripData.status || TRIP_STATUS.active,
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
          item.id === requestId
            ? { ...item, status: RIDE_REQUEST_STATUS.declined, decidedAt: new Date().toISOString() }
            : item,
        ),
      );
      setMessage('Demo mode: Passenger request declined.');
      return;
    }

    setBusyRequestId(requestId);
    setMessage('');

    try {
      await runTransaction(db, async (transaction) => {
        const requestRef = doc(db, FIRESTORE_COLLECTIONS.rideRequests, requestId);
        const requestSnap = await transaction.get(requestRef);
        if (!requestSnap.exists()) throw new Error('Request not found.');

        const latestRequest = requestSnap.data();
        const currentStatus = (latestRequest.status || '').toLowerCase();
        if (currentStatus !== RIDE_REQUEST_STATUS.pending) {
          throw new Error('This request has already been processed.');
        }

        transaction.update(requestRef, {
          status: RIDE_REQUEST_STATUS.declined,
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

  const hasError = message.startsWith('Error');

  return (
    <div style={{ padding: '22px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '14px',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          marginBottom: '12px',
        }}
      >
        <div style={{ flex: 1, minWidth: '200px', textAlign: 'left' }}>
          <span style={{ ...pills.base, ...pills.accent }}>
            <span aria-hidden="true">📥</span> Inbox
          </span>
          <h2 style={{ ...typography.h2, margin: '10px 0 4px' }}>Passenger requests</h2>
          <p style={{ ...typography.body, margin: 0 }}>
            Review pending riders. Approvals auto-deduct a seat.
          </p>
          {!firebaseReady && (
            <p style={{ marginTop: '6px', color: '#92400e', fontWeight: 700, fontSize: '0.8rem' }}>
              Demo mode: showing local sample requests.
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <StatPill
            label="Pending"
            value={pendingRequests.length}
            tone={pendingRequests.length ? 'warning' : 'success'}
          />
          <StatPill label="Approved" value={approvedRequests.length} tone="info" />
          <StatPill label="Trips" value={trips.length} tone="muted" />
        </div>
      </div>

      {message && (
        <p
          style={{
            marginTop: '10px',
            padding: '10px 14px',
            borderRadius: radius.md,
            fontWeight: 600,
            fontSize: '0.88rem',
            color: hasError ? colors.danger : colors.success,
            backgroundColor: hasError ? colors.dangerSoft : colors.successSoft,
          }}
        >
          {message}
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gap: '12px',
          marginTop: '18px',
          gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr',
        }}
      >
        {pendingRequests.length === 0 ? (
          <div
            style={{
              padding: '26px',
              borderRadius: radius.lg,
              border: `1px dashed ${colors.borderStrong}`,
              backgroundColor: colors.surfaceMuted,
              textAlign: 'center',
              gridColumn: '1 / -1',
            }}
          >
            <div style={{ fontSize: '1.8rem', marginBottom: '6px' }} aria-hidden="true">
              ☀️
            </div>
            <strong style={{ color: colors.text }}>All caught up</strong>
            <p style={{ ...typography.body, marginTop: '4px', marginBottom: 0 }}>
              New passenger requests show up here automatically.
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
              <div
                key={request.id}
                style={{
                  padding: '18px',
                  borderRadius: radius.lg,
                  backgroundColor: colors.surfaceSolid,
                  border: `1px solid ${colors.border}`,
                  boxShadow: shadows.soft,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', minWidth: 0 }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.accentSoft,
                        color: colors.accent,
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        flexShrink: 0,
                      }}
                    >
                      {(request.passengerEmail || request.passengerName || 'P')
                        .slice(0, 1)
                        .toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          ...typography.h3,
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {request.passengerEmail || request.passengerName || 'Passenger'}
                      </div>
                      <div style={{ color: colors.textSubtle, fontSize: '0.82rem', marginTop: '2px' }}>
                        {trip?.origin || 'Unknown origin'} → {trip?.destination || 'Unknown destination'}
                      </div>
                    </div>
                  </div>

                  <span style={{ ...pills.base, ...pills.warning, flexShrink: 0 }}>
                    {request.status}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '10px',
                  }}
                >
                  <InfoItem
                    label="Departure"
                    value={
                      trip?.departureTime
                        ? new Date(trip.departureTime).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : '—'
                    }
                  />
                  <InfoItem label="Seats left" value={remainingSeats ?? '—'} accent />
                  {request.note && <InfoItem label="Note" value={request.note} wide />}
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleApprove(request.id)}
                    disabled={isBusy}
                    style={{
                      ...buttons.accent,
                      flex: 1,
                      minWidth: '120px',
                      opacity: isBusy ? 0.7 : 1,
                      cursor: isBusy ? 'wait' : 'pointer',
                    }}
                  >
                    {isBusy ? 'Working…' : '✓ Accept'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecline(request.id)}
                    disabled={isBusy}
                    style={{
                      ...buttons.ghost,
                      flex: 1,
                      minWidth: '120px',
                      color: colors.danger,
                      borderColor: 'rgba(220, 38, 38, 0.25)',
                      opacity: isBusy ? 0.7 : 1,
                      cursor: isBusy ? 'wait' : 'pointer',
                    }}
                  >
                    {isBusy ? 'Working…' : 'Decline'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div
        style={{
          marginTop: '18px',
          padding: '16px 18px',
          borderRadius: radius.lg,
          background: 'linear-gradient(135deg, rgba(29, 78, 216, 0.08), rgba(15, 118, 110, 0.06))',
          border: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ ...typography.eyebrow, color: colors.info, marginBottom: '4px' }}>
          Approved riders
        </div>
        <div style={{ ...typography.body, margin: 0 }}>
          {approvedRequests.length === 0
            ? 'Approved passengers will appear here once you accept them.'
            : `${approvedRequests.length} passenger(s) confirmed across your trips.`}
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, tone = 'muted' }) {
  const palette = pills[tone] || pills.muted;
  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: radius.lg,
        backgroundColor: palette.backgroundColor,
        color: palette.color,
        minWidth: '78px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '1.3rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div
        style={{
          fontSize: '0.64rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginTop: '4px',
        }}
      >
        {label}
      </div>
    </div>
  );
}

function InfoItem({ label, value, accent = false, wide = false }) {
  return (
    <div style={{ gridColumn: wide ? '1 / -1' : 'auto' }}>
      <div
        style={{
          fontSize: '0.62rem',
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: colors.textSubtle,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: '2px',
          fontWeight: accent ? 800 : 600,
          color: accent ? colors.accent : colors.text,
          fontSize: '0.88rem',
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default DriverDashboard;
