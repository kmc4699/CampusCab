# CampusCab

A peer-to-peer carpool booking platform for university students.

## Overview

CampusCab connects university drivers and passengers for shared rides to and from campus. Only verified university students (`.ac.nz` email) can register.

## Current Architecture

The active app flow is:

```
React frontend → Firebase Auth / Firestore
```

Driver trip creation, vehicle profiles, driver request handling, and passenger trip search use the Firebase client SDK directly against hosted Firestore. The Express backend remains in the repo as a planned secondary API surface, but it is not required for the main frontend demo flow.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19.2.4 + Vite 8.0.0 |
| Backend | Node.js 24.14.0 + Express.js |
| Database | Firebase Firestore (NoSQL) |
| Authentication | Firebase Authentication |
| Geospatial | h3-js |

## Project Structure

```
CampusCab/
├── backend/
│   ├── config/
│   │   └── firebaseConfig.js     # Firebase Admin SDK init
│   ├── controllers/
│   │   ├── authController.js     # Registration, login, logout
│   │   ├── tripController.js     # Create, search, view, cancel trips
│   │   ├── bookingController.js  # Request, approve, decline bookings
│   │   └── messageController.js  # Trip messaging
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
        │   ├── AuthUI.jsx
        │   ├── PassengerDashboard.jsx
        │   └── DriverDashboard.jsx
        ├── services/
        │   └── api.js            # Fetch wrappers for all API routes
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

Edit `frontend/.env` with the Firebase web app values from Firebase Console.

```bash
npm run dev
# App runs on http://localhost:5173
```

### 3. Optional backend setup

The frontend uses Firebase directly for the active app flow. The Express backend is kept for planned API work and can be run separately when needed.

```bash
cd backend
npm install
cp .env.example .env
node server.js
# Server runs on http://localhost:3000
```

For backend Firebase Admin access, set `GOOGLE_APPLICATION_CREDENTIALS` or the service-account fields in `backend/.env`.

## API Routes

### Auth — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register with `.ac.nz` email |
| POST | `/login` | Verify Firebase ID token |
| POST | `/logout` | Revoke session |

### Trips — `/api/trips`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Driver creates a trip listing |
| GET | `/search?campus=&date=` | Search available trips |
| GET | `/:id` | Get trip details |
| DELETE | `/:id` | Cancel a trip |

### Bookings — `/api/bookings`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Passenger requests to join a trip |
| PUT | `/:id/approve` | Driver approves request (atomic transaction) |
| PUT | `/:id/decline` | Driver declines request |
| DELETE | `/:id` | Passenger cancels request |

### Messages — `/api/messages`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Send a message |
| GET | `/:tripId` | Get messages for a trip |

## Frontend Routes

| Path | Component |
|---|---|
| `/` | AuthUI |
| `/passenger` | PassengerDashboard |
| `/driver` | DriverDashboard |

## Database Collections

- **users** — userId, fullName, email, role, universityId, studentVerified, averageRating, accountStatus
- **vehicles** — vehicleId, driverId, plateNumber, make, model, colour, seatCapacity, verified
- **tripListings** — tripId, driverId, originArea, destinationCampus, departureDate, departureTime, seats, pricePerSeat, tripStatus, h3Index
- **rideRequests** — requestId, tripId, passengerId, seatsRequested, requestStatus, pickupLocation

## Team

Built for AUT — Programming Design & Construction.
