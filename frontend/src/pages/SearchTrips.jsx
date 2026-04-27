import React, { useState } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, firebaseReady, auth } from '../firebase';
import { FIRESTORE_COLLECTIONS, TRIP_STATUS, RIDE_REQUEST_STATUS } from '../firestoreModel';

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

  const handleBookTrip = async (trip) => {
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
      await addDoc(requestsRef, {
        tripId: trip.id,
        tripOwnerId: trip.driverId || 'unknown_driver',
        passengerId: user.uid,
        passengerName: user.displayName || 'Passenger',
        passengerEmail: user.email || '',
        status: RIDE_REQUEST_STATUS.pending,
        createdAt: serverTimestamp(),
        note: 'Requested from Search UI'
      });

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
                  onClick={() => setSelectedTripId(trip.id)}
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
                      <button 
                        style={{ padding: '8px 16px', backgroundColor: '#28a745', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookTrip(trip);
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
