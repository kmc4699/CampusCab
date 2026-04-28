import React, { useState } from 'react';
import { collection, query, where, getDocs, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db, firebaseReady, auth } from '../firebase';
import {
  FIRESTORE_COLLECTIONS,
  NOTIFICATION_STATUS,
  TRIP_STATUS,
  RIDE_REQUEST_STATUS,
} from '../firestoreModel';

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
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (isSameDepartureDate(data.departureTime, date) && hasAvailableSeats(data)) {
          results.push({ id: doc.id, ...data });
        }
      });

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
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Search Available Trips</h2>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
        <div>
          <label htmlFor="campus" style={{ display: 'block', marginBottom: '5px' }}>Destination Campus:</label>
          <select 
            id="campus" 
            value={campus} 
            onChange={(e) => setCampus(e.target.value)} 
            required
            style={{ width: '100%', padding: '10px' }}
          >
            <option value="">Select a Campus</option>
            <option value="City Campus">City Campus</option>
            <option value="South Campus">South Campus</option>
            <option value="North Campus">North Campus</option>
          </select>
        </div>

        <div>
          <label htmlFor="date" style={{ display: 'block', marginBottom: '5px' }}>Departure Date:</label>
          <input 
            type="date" 
            id="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !campus || !date}
          style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007BFF', color: '#FFF', border: 'none', borderRadius: '4px' }}
        >
          {loading ? 'Searching...' : 'Search Rides'}
        </button>
      </form>

      {/* Results Section */}
      <div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        {loading && <p>Loading available rides...</p>}
        
        {!loading && hasSearched && trips.length === 0 && !error && (
          <p style={{ color: 'gray', fontStyle: 'italic' }}>No rides available</p>
        )}
        
        {!loading && hasSearched && trips.length > 0 && (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {trips.map((trip) => {
              const isSelected = selectedTripId === trip.id;
              return (
                <li 
                  key={trip.id} 
                  onClick={() => {
                    setSelectedTripId(trip.id);
                    setSeatsToBook(1);
                  }}
                  style={{ 
                    border: isSelected ? '2px solid #007BFF' : '1px solid #ccc',
                    backgroundColor: isSelected ? '#e6f2ff' : 'transparent',
                    padding: '15px', 
                    marginBottom: '10px', 
                    borderRadius: '5px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <p><strong>Origin:</strong> {trip.origin}</p>
                  <p><strong>Destination:</strong> {trip.destination}</p>
                  <p><strong>Departure:</strong> {formatDeparture(trip.departureTime)}</p>
                  <p><strong>Available Seats:</strong> {trip.availableSeats}</p>
                  {isSelected && (
                    <div style={{ marginTop: '15px' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <label htmlFor={`seats-${trip.id}`} style={{ marginRight: '10px' }}>Seats to book:</label>
                        <input
                          id={`seats-${trip.id}`}
                          type="number"
                          min="1"
                          max={trip.availableSeats}
                          value={seatsToBook}
                          onChange={(e) => setSeatsToBook(Number(e.target.value))}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: '60px', padding: '5px' }}
                        />
                      </div>
                      <button 
                        style={{ padding: '8px 16px', backgroundColor: '#28a745', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookTrip(trip, seatsToBook);
                        }}
                      >
                        Choose this Ride
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchTrips;
