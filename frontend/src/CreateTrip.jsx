import React, { useState } from 'react';
import { db, auth } from './firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { buttons, colors, inputs, pills, radius, shadows, typography } from './theme';

function Field({ label, helper, children }) {
  return (
    <div style={{ marginBottom: '16px', textAlign: 'left' }}>
      <label style={inputs.label}>{label}</label>
      {children}
      {helper && <p style={inputs.helper}>{helper}</p>}
    </div>
  );
}

function StyledInput(props) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
      style={{
        ...inputs.field,
        ...(focused ? inputs.fieldFocus : null),
        ...(props.style || {}),
      }}
    />
  );
}

function StyledSelect(props) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
      style={{
        ...inputs.field,
        ...(focused ? inputs.fieldFocus : null),
        appearance: 'none',
        WebkitAppearance: 'none',
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 20 20' fill='%2364748b'><path d='M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 011.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'/></svg>\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
        paddingRight: '40px',
      }}
    />
  );
}

function CreateTrip() {
  const [origin, setOrigin] = useState('North Shore');
  const [destination, setDestination] = useState('City Campus');
  const [departureTime, setDepartureTime] = useState('');
  const [seats, setSeats] = useState(3);
  const [message, setMessage] = useState('');
  const [recentTrip, setRecentTrip] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (seats <= 0) {
      setMessage('Error: You must have at least 1 available seat.');
      return;
    }

    const selectedDate = new Date(departureTime);
    const now = new Date();
    if (selectedDate <= now) {
      setMessage('Error: Departure time must be in the future.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const tripData = {
        driverId: user.uid,
        driverEmail: user.email,
        origin,
        destination,
        departureTime,
        seats: parseInt(seats, 10),
        availableSeats: parseInt(seats, 10),
        status: 'active',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'trips'), tripData);

      setMessage('Success! Trip published to the feed.');
      setRecentTrip(tripData);
    } catch (error) {
      setMessage('Error saving trip: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasError = message.startsWith('Error');

  return (
    <div style={{ padding: '32px', textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
        <span style={{ ...pills.base, ...pills.info }}>
          <span aria-hidden="true">🛣️</span> New Trip
        </span>
      </div>
      <h2 style={{ ...typography.h2, margin: '10px 0 6px' }}>Publish a trip</h2>
      <p style={{ ...typography.body, margin: '0 0 22px' }}>
        Let passengers find your ride by setting the route, time, and how many seats are free.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <Field label="Origin">
            <StyledSelect value={origin} onChange={(e) => setOrigin(e.target.value)}>
              <option value="North Shore">North Shore</option>
              <option value="West Auckland">West Auckland</option>
              <option value="South Auckland">South Auckland</option>
              <option value="East Auckland">East Auckland</option>
            </StyledSelect>
          </Field>

          <Field label="Destination">
            <StyledSelect value={destination} onChange={(e) => setDestination(e.target.value)}>
              <option value="City Campus">City Campus</option>
              <option value="North Campus">North Campus</option>
              <option value="South Campus">South Campus</option>
            </StyledSelect>
          </Field>
        </div>

        <Field label="Departure date & time" helper="Must be in the future.">
          <StyledInput
            type="datetime-local"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            required
          />
        </Field>

        <Field label="Available seats" helper="How many passengers can you take?">
          <StyledInput
            type="number"
            min="1"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            required
          />
        </Field>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            ...buttons.primary,
            width: '100%',
            marginTop: '6px',
            opacity: isSubmitting ? 0.7 : 1,
            cursor: isSubmitting ? 'wait' : 'pointer',
          }}
        >
          {isSubmitting ? 'Publishing…' : 'Publish trip'}
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: '16px',
            padding: '10px 14px',
            borderRadius: radius.md,
            fontWeight: 600,
            color: hasError ? colors.danger : colors.success,
            backgroundColor: hasError ? colors.dangerSoft : colors.successSoft,
          }}
        >
          {message}
        </p>
      )}

      {recentTrip && (
        <div
          style={{
            marginTop: '22px',
            padding: '18px 20px',
            borderRadius: radius.lg,
            background: 'linear-gradient(135deg, rgba(29, 78, 216, 0.08), rgba(15, 118, 110, 0.06))',
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.soft,
          }}
        >
          <div style={{ ...typography.eyebrow, color: colors.info, marginBottom: '10px' }}>
            Live trip feed view
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ ...typography.h3, marginBottom: '6px' }}>
                {recentTrip.origin} → {recentTrip.destination}
              </div>
              <div style={{ color: colors.textSubtle, fontSize: '0.92rem' }}>
                Departs {new Date(recentTrip.departureTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </div>
            </div>
            <span style={{ ...pills.base, ...pills.success }}>
              {recentTrip.availableSeats} seats
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateTrip;
