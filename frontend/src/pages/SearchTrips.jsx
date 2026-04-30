import React, { useState } from 'react';
import { collection, query, where, getDocs, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db, firebaseReady, auth } from '../firebase';
import {
  FIRESTORE_COLLECTIONS,
  NOTIFICATION_STATUS,
  TRIP_STATUS,
  RIDE_REQUEST_STATUS,
} from '../firestoreModel';
import { colors, radius, spacing, typography, surfaces, buttons, inputs, pills, shadows } from '../theme';
import { AddressSearch } from '../components/MapComponents';
import * as turf from '@turf/turf';

function isSameDepartureDate(departureTime, selectedDate) {
  return Boolean(departureTime && selectedDate && departureTime.startsWith(selectedDate));
}

function hasAvailableSeats(trip) {
  return Number(trip.availableSeats) > 0;
}

function formatDeparture(departureTime) {
  if (!departureTime) return 'Departure time unavailable';
  return new Date(departureTime).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

const SearchTrips = () => {
  const [campus, setCampus] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [passengerLocation, setPassengerLocation] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [seatsToBook, setSeatsToBook] = useState(1);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setHasSearched(true);
    setLoading(true);
    setSelectedTripId(null);

    try {
      if (!firebaseReady || !db) {
        setTrips([]);
        setError('Demo mode: Firebase is not configured, so hosted trip search is unavailable.');
        return;
      }

      const tripsRef = collection(db, FIRESTORE_COLLECTIONS.trips);
      const q = query(
        tripsRef,
        where('destination', '==', campus),
        where('status', '==', TRIP_STATUS.active)
      );

      const querySnapshot = await getDocs(q);
      const results = [];
      const selectedDateTime = new Date(`${date}T${time}`);
      
      let passengerPt = null;
      if (passengerLocation) {
        passengerPt = turf.point([passengerLocation.lon, passengerLocation.lat]);
      }
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (isSameDepartureDate(data.departureTime, date) && hasAvailableSeats(data)) {
          const tripDateTime = new Date(data.departureTime);
          if (tripDateTime >= selectedDateTime) {
            
            // Check 10km radius if the trip has a routeGeoJson and passenger provided a location
            let distanceKm = null;
            let withinRange = true;

            if (data.routeGeoJson && passengerPt) {
              const parsedGeoJson = typeof data.routeGeoJson === 'string' ? JSON.parse(data.routeGeoJson) : data.routeGeoJson;
              const routeLine = turf.lineString(parsedGeoJson.coordinates);
              distanceKm = turf.pointToLineDistance(passengerPt, routeLine, { units: 'kilometers' });
              
              if (distanceKm > 10) {
                withinRange = false;
              }
            }
            
            if (withinRange) {
              results.push({ id: doc.id, distanceKm, ...data });
            }
          }
        }
      });

      // Sort by closest time first
      results.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));

      setTrips(results);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while searching for trips.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookTrip = async (trip, requestedSeats) => {
    if (!firebaseReady || !db || !auth) {
      alert('Demo mode: Booking request simulated.');
      setSelectedTripId(null);
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError('You must be signed in to book a ride.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestsRef = collection(db, FIRESTORE_COLLECTIONS.rideRequests);
      const requestRef = doc(requestsRef);
      const notificationRef = doc(collection(db, FIRESTORE_COLLECTIONS.notifications));
      const passengerName = user.displayName || 'Passenger';
      const passengerEmail = user.email || '';
      const tripOwnerId = trip.driverId || 'unknown_driver';
      const batch = writeBatch(db);

      batch.set(requestRef, {
        tripId: trip.id,
        tripOwnerId,
        passengerId: user.uid,
        passengerName,
        passengerEmail,
        status: RIDE_REQUEST_STATUS.pending,
        createdAt: serverTimestamp(),
        note: `Requested ${requestedSeats} seat(s)`,
        seatsRequested: requestedSeats
      });
      batch.set(notificationRef, {
        type: 'ride_request',
        recipientId: tripOwnerId,
        tripId: trip.id,
        requestId: requestRef.id,
        passengerId: user.uid,
        passengerName,
        passengerEmail,
        seatsRequested: requestedSeats,
        status: NOTIFICATION_STATUS.unread,
        message: `${passengerName} requested ${requestedSeats} seat(s).`,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      alert('Booking request sent successfully!');
      setSelectedTripId(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while sending the booking request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: spacing.xl }}>
      <div style={{ textAlign: 'center', marginBottom: spacing.xl }}>
        <h2 style={{ ...typography.display, marginBottom: spacing.xs }}>Where to?</h2>
        <p style={{ ...typography.body }}>Find available rides from your campus</p>
      </div>
      
      <form onSubmit={handleSearch} style={{ ...surfaces.card, padding: spacing.xl, marginBottom: spacing.xxl }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg, marginBottom: spacing.xl }}>
          <AddressSearch 
            label="Your Pickup Location" 
            placeholder="e.g. 123 Main St" 
            onSelect={setPassengerLocation} 
          />
          
          <div>
            <label htmlFor="campus" style={{ ...inputs.label }}>Destination Campus</label>
            <select 
              id="campus" 
              value={campus} 
              onChange={(e) => setCampus(e.target.value)} 
              required
              style={{ ...inputs.field, cursor: 'pointer' }}
            >
              <option value="">Select a Campus</option>
              <option value="City Campus">City Campus</option>
              <option value="South Campus">South Campus</option>
              <option value="North Campus">North Campus</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg }}>
            <div>
              <label htmlFor="date" style={{ ...inputs.label }}>Departure Date</label>
              <input 
                type="date" 
                id="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required
                style={{ ...inputs.field }}
              />
            </div>
            <div>
              <label htmlFor="time" style={{ ...inputs.label }}>Earliest Time</label>
              <input 
                type="time" 
                id="time" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                required
                style={{ ...inputs.field }}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || !campus || !date || !time || !passengerLocation}
          style={{ 
            ...buttons.primary, 
            opacity: (loading || !campus || !date || !time || !passengerLocation) ? 0.7 : 1,
            cursor: (loading || !campus || !date || !time || !passengerLocation) ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Searching...' : 'Search Rides'}
        </button>
      </form>

      {/* Results Section */}
      <div>
        {error && (
          <div style={{ padding: spacing.md, backgroundColor: colors.dangerSoft, color: colors.danger, borderRadius: radius.md, marginBottom: spacing.lg, ...typography.small, fontWeight: 700 }}>
            {error}
          </div>
        )}
        
        {loading && (
          <div style={{ textAlign: 'center', padding: spacing.xl, color: colors.textSubtle }}>
            <p style={{ ...typography.body, fontWeight: 600 }}>Looking for rides...</p>
          </div>
        )}
        
        {!loading && hasSearched && trips.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: spacing.xl, ...surfaces.innerCard, backgroundColor: 'transparent', borderStyle: 'dashed' }}>
            <p style={{ ...typography.body, color: colors.textSubtle }}>No rides available for this time.</p>
          </div>
        )}
        
        {!loading && hasSearched && trips.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            <h3 style={{ ...typography.h2, marginBottom: spacing.sm }}>Available Rides</h3>
            {trips.map((trip) => {
              const isSelected = selectedTripId === trip.id;
              return (
                <div 
                  key={trip.id} 
                  onClick={() => {
                    setSelectedTripId(trip.id);
                    setSeatsToBook(1);
                  }}
                  style={{ 
                    ...surfaces.innerCard,
                    padding: spacing.lg,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    border: isSelected ? `2px solid ${colors.accent}` : surfaces.innerCard.border,
                    boxShadow: isSelected ? shadows.soft : 'none',
                    backgroundColor: isSelected ? colors.surfaceSolid : colors.surfaceMuted,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
                    <div>
                      <div style={{ ...typography.small, color: colors.textSubtle, marginBottom: '4px', fontWeight: 600 }}>
                        {formatDeparture(trip.departureTime)}
                      </div>
                      <div style={{ ...typography.h3, marginBottom: spacing.xs }}>
                        {trip.origin} <span style={{ color: colors.textSubtle }}>→</span> {trip.destination}
                      </div>
                    </div>
                    <div style={{ ...pills.base, ...pills.accent }}>
                      {trip.availableSeats} seat{trip.availableSeats > 1 ? 's' : ''}
                    </div>
                  </div>

                  {isSelected && (
                    <div style={{ 
                      marginTop: spacing.md, 
                      paddingTop: spacing.md, 
                      borderTop: `1px solid ${colors.border}`,
                      animation: 'fadeIn 0.3s ease'
                    }}>
                      <div style={{ marginBottom: spacing.md, ...typography.small, color: colors.textSubtle }}>
                        <strong>Driver:</strong> {trip.driverEmail} <br/>
                        {trip.distanceKm !== null && (
                          <span><strong>Proximity:</strong> Approx. {trip.distanceKm.toFixed(1)} km from your pickup location.</span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg }}>
                        <label htmlFor={`seats-${trip.id}`} style={{ ...inputs.label, marginBottom: 0 }}>Seats to book</label>
                        <input
                          id={`seats-${trip.id}`}
                          type="number"
                          min="1"
                          max={trip.availableSeats}
                          value={seatsToBook}
                          onChange={(e) => setSeatsToBook(Number(e.target.value))}
                          onClick={(e) => e.stopPropagation()}
                          style={{ ...inputs.field, width: '80px', padding: '10px 14px', textAlign: 'center' }}
                        />
                      </div>
                      <button 
                        style={{ ...buttons.primary, padding: '12px 20px', fontSize: '0.9rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookTrip(trip, seatsToBook);
                        }}
                      >
                        Request to Book
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchTrips;
