import React, { useState } from 'react';
import { db, auth } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

function VehicleProfile() {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [message, setMessage] = useState('');
  const [savedVehicle, setSavedVehicle] = useState(null);

  // USER STORY 3, TEST 1: Disable button if license plate is blank
  const isButtonDisabled = licensePlate.trim() === '';

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) return; // Safety check

      const vehicleData = { make, model, licensePlate };

      // This sends the data to your new Firestore database!
      await setDoc(doc(db, "vehicles", user.uid), vehicleData);

      setMessage("Vehicle details saved successfully!");
      setSavedVehicle(vehicleData); // Stores it to show on the profile
    } catch (error) {
      setMessage("Error saving: " + error.message);
    }
  };

  return (
    <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fafafa' }}>
      <h3>🚗 Add Vehicle Details</h3>
      <form onSubmit={handleSave}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Make (e.g., Toyota)"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            required
            style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Model (e.g., Prius)"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
            style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="License Plate (Required)"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={isButtonDisabled}
          style={{
            padding: '10px 20px',
            backgroundColor: isButtonDisabled ? '#cccccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {isButtonDisabled ? "Enter License Plate to Save" : "Save Vehicle"}
        </button>
      </form>

      {message && <p style={{ color: 'green', fontWeight: 'bold', marginTop: '15px' }}>{message}</p>}

      {/* USER STORY 3, TEST 2: Show details on public profile once saved */}
      {savedVehicle && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px', textAlign: 'left' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Public Driver Profile</h4>
          <p style={{ margin: '5px 0' }}><strong>Make:</strong> {savedVehicle.make}</p>
          <p style={{ margin: '5px 0' }}><strong>Model:</strong> {savedVehicle.model}</p>
          <p style={{ margin: '5px 0' }}><strong>License Plate:</strong> {savedVehicle.licensePlate}</p>
        </div>
      )}
    </div>
  );
}

export default VehicleProfile;