import React, { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { FIRESTORE_COLLECTIONS, TRIP_STATUS } from '../firestoreModel';

function isSameDepartureDate(departureTime, selectedDate) {
  return Boolean(departureTime && selectedDate && departureTime.startsWith(selectedDate));
}

function hasAvailableSeats(trip) {
  return Number(trip.availableSeats) > 0;
}

const SearchTrips = () => {
  const [campus, setCampus] = useState('');
  const [date, setDate] = useState('');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setHasSearched(true);
    setLoading(true);

    try {
      if (!db) {
        throw new Error("Firebase database is not initialized.");
      }

      // Query trips by destination and active status.
      // Filtering by exact date and availableSeats > 0 is done locally to avoid complex Firestore composite index requirements.
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
        // date is from an input type="date", so it looks like "2026-04-27"
        // data.departureTime is a datetime-local string like "2026-04-27T10:00"
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
            {trips.map((trip) => (
              <li key={trip.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '5px' }}>
                <p><strong>Origin:</strong> {trip.origin}</p>
                <p><strong>Destination:</strong> {trip.destination}</p>
                <p><strong>Departure:</strong> {new Date(trip.departureTime).toLocaleString()}</p>
                <p><strong>Available Seats:</strong> {trip.availableSeats}</p>
                {/* Add a button to view details or book */}
                <button style={{ marginTop: '10px', padding: '5px 10px' }}>View Details</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchTrips;
