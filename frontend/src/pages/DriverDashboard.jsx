import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, query, runTransaction, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { buttons, colors, pills, radius, shadows, typography } from '../theme';

function DriverDashboard() {
  const [trips, setTrips] = useState([]);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [busyRequestId, setBusyRequestId] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return undefined;

    const tripsQuery = query(collection(db, 'trips'), where('driverId', '==', user.uid));
    const requestsQuery = query(collection(db, 'rideRequests'), where('tripOwnerId', '==', user.uid));

    const unsubscribeTrips = onSnapshot(tripsQuery, (snapshot) => {
      const tripDocs = snapshot.docs.map((tripDoc) => ({ id: tripDoc.id, ...tripDoc.data() }));
      setTrips(tripDocs);
    });

    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const requestDocs = snapshot.docs.map((requestDoc) => ({ id: requestDoc.id, ...requestDoc.data() }));
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
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)),
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

        if (!requestSnap.exists()) throw new Error('Request not found.');
        if (!tripSnap.exists()) throw new Error('Trip not found.');

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

    setBusyRequestId(requestId);
    setMessage('');

    try {
      await runTransaction(db, async (transaction) => {
        const requestRef = doc(db, 'rideRequests', requestId);
        const requestSnap = await transaction.get(requestRef);
        if (!requestSnap.exists()) throw new Error('Request not found.');

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

  const hasError = message.startsWith('Error');

  return (
    <div style={{ padding: '32px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ ...pills.base, ...pills.accent }}>
              <span aria-hidden="true">📥</span> Inbox
            </span>
          </div>
          <h2 style={{ ...typography.h2, margin: '10px 0 6px' }}>Passenger requests</h2>
          <p style={{ ...typography.body, margin: 0 }}>
            Review pending riders before they get access to your trip. Approvals auto-deduct a seat.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <StatPill label="Pending" value={pendingRequests.length} tone={pendingRequests.length ? 'warning' : 'success'} />
          <StatPill label="Approved" value={approvedRequests.length} tone="info" />
          <StatPill label="Active trips" value={trips.length} tone="muted" />
        </div>
      </div>

      {message && (
        <p
          style={{
            marginTop: '20px',
            padding: '12px 16px',
            borderRadius: radius.md,
            fontWeight: 600,
            color: hasError ? colors.danger : colors.success,
            backgroundColor: hasError ? colors.dangerSoft : colors.successSoft,
          }}
        >
          {message}
        </p>
      )}

      <div style={{ display: 'grid', gap: '14px', marginTop: '24px' }}>
        {pendingRequests.length === 0 ? (
          <div
            style={{
              padding: '28px',
              borderRadius: radius.lg,
              border: `1px dashed ${colors.borderStrong}`,
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '6px' }} aria-hidden="true">
              ☀️
            </div>
            <strong style={{ color: colors.text }}>All caught up</strong>
            <p style={{ ...typography.body, marginTop: '6px', marginBottom: 0 }}>
              New passenger requests show up here automatically — no refresh needed.
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
                  padding: '20px',
                  borderRadius: radius.lg,
                  backgroundColor: colors.surfaceSolid,
                  border: `1px solid ${colors.border}`,
                  boxShadow: shadows.soft,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.accentSoft,
                        color: colors.accent,
                        fontWeight: 800,
                        fontSize: '1rem',
                      }}
                    >
                      {(request.passengerEmail || request.passengerName || 'P').slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ ...typography.h3, margin: 0 }}>
                        {request.passengerEmail || request.passengerName || 'Passenger request'}
                      </div>
                      <div style={{ color: colors.textSubtle, fontSize: '0.88rem', marginTop: '2px' }}>
                        {trip?.origin || 'Unknown origin'} → {trip?.destination || 'Unknown destination'}
                      </div>
                    </div>
                  </div>

                  <span style={{ ...pills.base, ...pills.warning }}>{request.status}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '16px' }}>
                  <InfoItem
                    label="Departure"
                    value={trip?.departureTime ? new Date(trip.departureTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                  />
                  <InfoItem label="Seats remaining" value={remainingSeats ?? '—'} accent />
                  {request.note && <InfoItem label="Note from passenger" value={request.note} wide />}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '18px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleApprove(request.id)}
                    disabled={isBusy}
                    style={{
                      ...buttons.accent,
                      flex: 1,
                      minWidth: '140px',
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
                      minWidth: '140px',
                      color: colors.danger,
                      borderColor: 'rgba(185, 28, 28, 0.25)',
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
          marginTop: '20px',
          padding: '20px',
          borderRadius: radius.lg,
          background: 'linear-gradient(135deg, rgba(29, 78, 216, 0.08), rgba(15, 118, 110, 0.06))',
          border: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ ...typography.eyebrow, color: colors.info, marginBottom: '6px' }}>Approved riders</div>
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
        padding: '10px 16px',
        borderRadius: radius.lg,
        backgroundColor: palette.backgroundColor,
        color: palette.color,
        minWidth: '92px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>
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
          fontSize: '0.68rem',
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
          marginTop: '3px',
          fontWeight: accent ? 800 : 600,
          color: accent ? colors.accent : colors.text,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default DriverDashboard;
