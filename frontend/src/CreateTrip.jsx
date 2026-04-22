import React, { useState } from 'react';
import { db, auth } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

function CreateTrip() {
  const [origin, setOrigin] = useState('North Shore');
  const [destination, setDestination] = useState('City Campus');
  const [departureTime, setDepartureTime] = useState('');
  const [seats, setSeats] = useState(3);
  const [message, setMessage] = useState('');
  const [recentTrip, setRecentTrip] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // USER STORY 6, TEST 1: Block 0 or negative seats
    if (seats <= 0) {
      setMessage("Error: You must have at least 1 available seat.");
      return;
    }

    // USER STORY 5, TEST 1: Block past dates
    const selectedDate = new Date(departureTime);
    const now = new Date();
    if (selectedDate <= now) {
      setMessage("Error: Departure time must be in the future.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      // USER STORY 4, TEST 1: Save origin and destination to trip object
      const tripData = {
        driverId: user.uid,
        driverEmail: user.email,
        origin: origin,
        destination: destination,
        departureTime: departureTime,
        seats: parseInt(seats),
        status: 'active'
      };
      
      // Save to a new Firestore collection called "trips"
      await addDoc(collection(db, "trips"), tripData);
      
      setMessage("Success! Trip published to the feed.");
      setRecentTrip(tripData); 
      
    } catch (error) {
      setMessage("Error saving trip: " + error.message);
    }
  };

  return (
    <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fafafa' }}>
      <h3>🛣️ Create a Trip Listing</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px', textAlign: 'left' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Origin:</label>
          <select value={origin} onChange={(e) => setOrigin(e.target.value)} style={{ padding: '8px', width: '100%', marginTop: '5px' }}>
            <option value="North Shore">North Shore</option>
            <option value="West Auckland">West Auckland</option>
            <option value="South Auckland">South Auckland</option>
            <option value="East Auckland">East Auckland</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px', textAlign: 'left' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Destination:</label>
          <select value={destination} onChange={(e) => setDestination(e.target.value)} style={{ padding: '8px', width: '100%', marginTop: '5px' }}>
            <option value="City Campus">City Campus</option>
            <option value="North Campus">North Campus</option>
            <option value="South Campus">South Campus</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px', textAlign: 'left' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Departure Date & Time:</label>
          <input 
            type="datetime-local" 
            value={departureTime} 
            onChange={(e) => setDepartureTime(e.target.value)} 
            required 
            style={{ padding: '8px', width: '100%', boxSizing: 'border-box', marginTop: '5px' }} 
          />
        </div>

        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Available Seats:</label>
          <input 
            type="number" 
            value={seats} 
            onChange={(e) => setSeats(e.target.value)} 
            required 
            style={{ padding: '8px', width: '100%', boxSizing: 'border-box', marginTop: '5px' }} 
          />
        </div>
        
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>
          Publish Trip
        </button>
      </form>

      {message && <p style={{ color: message.includes('Error') ? 'red' : 'green', fontWeight: 'bold', marginTop: '15px' }}>{message}</p>}

      {/* USER STORY 4, 5, & 6: Display the published trip card */}
      {recentTrip && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ffffff', border: '2px solid #007bff', borderRadius: '8px', textAlign: 'left' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#007bff' }}>Live Trip Feed View</h4>
          <p style={{ margin: '5px 0' }}><strong>Route:</strong> {recentTrip.origin} ➔ {recentTrip.destination}</p>
          <p style={{ margin: '5px 0' }}><strong>Departs:</strong> {new Date(recentTrip.departureTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
          <p style={{ margin: '5px 0', color: '#28a745', fontWeight: 'bold' }}>{recentTrip.seats} Seats Available</p>
        </div>
      )}
    </div>
  );
}

export default CreateTrip;
