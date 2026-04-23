import React, { useState } from 'react';
import { db, auth } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

function VehicleProfile({ initialVehicle = null, onSaved }) {
  const [make, setMake] = useState(initialVehicle?.make || '');
  const [model, setModel] = useState(initialVehicle?.model || '');
  const [licensePlate, setLicensePlate] = useState(initialVehicle?.licensePlate || '');
  const [message, setMessage] = useState('');
  const [savedVehicle, setSavedVehicle] = useState(initialVehicle);

  const isButtonDisabled = licensePlate.trim() === '';

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) return;

      const vehicleData = { make, model, licensePlate };
      await setDoc(doc(db, "vehicles", user.uid), vehicleData);

      setMessage("Vehicle details saved successfully!");
      setSavedVehicle(vehicleData);
      if (onSaved) onSaved(vehicleData);
    } catch (error) {
      setMessage("Error saving: " + error.message);
    }
  };

  const user = auth.currentUser;

  return (
    <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fafafa' }}>
      <h3>🚗 {initialVehicle ? 'Update Vehicle Details' : 'Add Vehicle Details'}</h3>
      {user?.email && (
        <p style={{ margin: '0 0 12px', color: '#52607a', fontSize: '0.9rem' }}>
          Signed in as <strong>{user.email}</strong>
        </p>
      )}
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
