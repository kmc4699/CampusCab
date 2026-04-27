# CampusCab

A peer-to-peer carpool booking platform for university students.

## Overview

CampusCab connects university drivers and passengers for shared rides to and from campus. Only verified university students (`.ac.nz` email) can register.

## Current Architecture

The active app flow is:

```
React frontend → Firebase Auth / Firestore
```

Driver trip creation, vehicle profiles, driver request handling, passenger trip search, and in-app request alerts use the Firebase client SDK directly against hosted Firestore. Browser push notifications are sent by Firebase Cloud Functions when ride requests are created. The Express backend remains in the repo as a planned secondary API surface, but it is not required for the main frontend demo flow.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19.2.4 + Vite 8.0.0 |
| Backend | Node.js 24.14.0 + Express.js |
| Database | Firebase Firestore (NoSQL) |
| Authentication | Firebase Authentication |
| Push | Firebase Cloud Messaging + Cloud Functions |
| Geospatial | h3-js |

## Project Structure

```
CampusCab/
├── backend/
│   ├── config/
│   │   └── firebaseConfig.js     # Firebase Admin SDK init
│   ├── controllers/
│   │   ├── authController.js     # Planned auth API handlers
│   │   ├── tripController.js     # Planned trip API handlers
│   │   ├── bookingController.js  # Planned booking API handlers
│   │   └── messageController.js  # Planned messaging API handlers
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── tripRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── messageRoutes.js
│   ├── .env.example
│   └── server.js
└── frontend/
    └── src/
        ├── pages/
        │   ├── SearchTrips.jsx
        │   ├── PassengerDashboard.jsx
        │   └── DriverDashboard.jsx
        ├── hooks/
        │   └── useIsDesktop.js
        ├── firestoreModel.js
        ├── App.jsx
        └── main.jsx
```

## Getting Started

### Prerequisites

- Node.js 22+ or 24+
- A Firebase project with Firestore and Authentication enabled

### 1. Clone the repository

```bash
git clone <repo-url>
cd CampusCab
```

### 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env` with the Firebase web app values from Firebase Console. Browser push notifications also require `VITE_FIREBASE_VAPID_KEY`, found in Firebase Console → Project settings → Cloud Messaging → Web Push certificates.

```bash
npm run dev
# App runs on http://localhost:5173
```

### 3. Optional backend setup
<!-- Dont use this anymore - we are only using firebase -->
The frontend uses Firebase directly for the active app flow. The Express backend is kept for planned API work and can be run separately when needed.

```bash
cd backend
npm install
cp .env.example .env
node server.js
# Server runs on http://localhost:3000
```

For backend Firebase Admin access, set `GOOGLE_APPLICATION_CREDENTIALS` or the service-account fields in `backend/.env`.

### 4. Optional Cloud Functions setup for browser push

```bash
cd backend/functions
npm install
```

Deploy Functions from the repo root when Firebase CLI is signed in to `campuscab-63e48`:

```bash
firebase deploy --only functions
```

To test push notifications, sign in as a driver, open the driver dashboard, enable browser push alerts, then request that driver's trip from a passenger account. The driver should see the in-app dashboard alert and, when the browser allows it, a browser push notification.

## Express API Routes

These routes are mounted by the backend. Auth, trips, and messages are still planned API surfaces. Bookings are implemented and mirror the active Firestore request flow.

### Auth — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Planned registration endpoint |
| POST | `/login` | Planned Firebase ID token profile endpoint |
| POST | `/logout` | Planned session revocation endpoint |

### Trips — `/api/trips`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Planned trip creation endpoint |
| GET | `/search?campus=&date=` | Planned trip search endpoint |
| GET | `/:id` | Planned trip details endpoint |
| DELETE | `/:id` | Planned trip cancellation endpoint |

### Bookings — `/api/bookings`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Passenger requests to join a trip and creates a driver dashboard notification |
| PUT | `/:id/approve` | Driver approves request (atomic transaction) |
| PUT | `/:id/decline` | Driver declines request |
| DELETE | `/:id` | Passenger cancels request |

### Messages — `/api/messages`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Send a message |
| GET | `/:tripId` | Get messages for a trip |

## Frontend Screens

| Screen | Component |
|---|---|
| Login/register | Login |
| Driver tab | DriverDashboard, VehicleProfile, CreateTrip |
| Passenger tab | PassengerDashboard, SearchTrips |
| Admin tab | Placeholder |

## Database Collections

- **trips** — driverId, driverEmail, origin, destination, departureTime, seats, availableSeats, status, createdAt
- **vehicles** — document ID is the driver UID; make, model, licensePlate
- **rideRequests** — request documents linked to trips; status values use pending, approved, declined, cancelled
- **notifications** — driver dashboard alerts for ride requests; unread notifications are shown on the driver dashboard
- **pushTokens** — driver browser FCM tokens used by Cloud Functions for push notifications

## Team

Built for AUT — Programming Design & Construction.
