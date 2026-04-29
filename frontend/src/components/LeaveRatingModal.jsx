import React, { useState } from 'react';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { FIRESTORE_COLLECTIONS } from '../firestoreModel';

function LeaveRatingModal({ ride, onClose, onRatingSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // The driver's ID is the target
  const targetUserId = ride.tripOwnerId || ride.trip?.driverId;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a star rating first.');
      return;
    }

    if (!targetUserId) {
      setError('Error: Could not find driver information.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 1. Save the rating anonymously
      await addDoc(collection(db, FIRESTORE_COLLECTIONS.ratings), {
        tripId: ride.tripId || '',
        requestId: ride.id,
        targetUserId: targetUserId,
        score: rating,
        createdAt: serverTimestamp(),
      });

      // 2. Recalculate the driver's aggregate score
      const userRef = doc(db, FIRESTORE_COLLECTIONS.users, targetUserId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const currentTotal = userData.totalRatings || 0;
        const currentAverage = userData.averageRating || 0;
        
        const newTotal = currentTotal + 1;
        // Formula to calculate new moving average
        const newAverage = ((currentAverage * currentTotal) + rating) / newTotal;

        await updateDoc(userRef, {
          totalRatings: newTotal,
          averageRating: Number(newAverage.toFixed(1)) 
        });
      }

      // 3. Success! Close modal and update parent
      onRatingSubmitted(ride.id);
      onClose();
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Failed to submit rating. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ marginTop: 0 }}>Rate your Driver</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Your feedback is anonymous and helps build trust in the CampusCab community.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '32px', marginBottom: '20px', cursor: 'pointer' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(rating)}
              style={{ color: star <= (hover || rating) ? '#fbbf24' : '#e5e7eb', transition: 'color 0.2s' }}
            >
              ★
            </span>
          ))}
        </div>

        {error && <p style={{ color: '#dc2626', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <button onClick={onClose} disabled={isSubmitting} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#0f766e', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeaveRatingModal;
