const BASE_URL = '/api';

// --- Auth ---

export async function register(userData) {
  void userData;
  // POST /api/auth/register
  // userData: { fullName, email, phoneNumber, password, role, universityId }
}

export async function login(idToken) {
  void idToken;
  // POST /api/auth/login
  // idToken: Firebase ID token obtained from client-side Firebase Auth sign-in
}

export async function logout(uid) {
  void uid;
  // POST /api/auth/logout
}

// --- Trips ---

export async function searchTrips(campus, date) {
  void campus;
  void date;
  // GET /api/trips/search?campus=&date=
}

export async function getTripById(tripId) {
  void tripId;
  // GET /api/trips/:id
}

export async function createTrip(tripData) {
  void tripData;
  // POST /api/trips
  // tripData: { originArea, destinationCampus, departureDate, departureTime,
  //             totalSeats, pricePerSeat, originLat, originLng, preferences }
}

export async function cancelTrip(tripId) {
  void tripId;
  // DELETE /api/trips/:id
}

// --- Bookings ---

export async function requestToJoin(bookingData) {
  void bookingData;
  // POST /api/bookings
  // bookingData: { tripId, seatsRequested, pickupLocation, note }
}

export async function approveRequest(requestId) {
  void requestId;
  // PUT /api/bookings/:id/approve
}

export async function declineRequest(requestId) {
  void requestId;
  // PUT /api/bookings/:id/decline
}

export async function cancelRequest(requestId) {
  void requestId;
  // DELETE /api/bookings/:id
}

// --- Messages ---

export async function sendMessage(messageData) {
  void messageData;
  // POST /api/messages
  // messageData: { tripId, content }
}

export async function getMessages(tripId) {
  void tripId;
  // GET /api/messages/:tripId
}
