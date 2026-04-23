const path = require('path');
const dotenv = require('dotenv');
const admin = require('firebase-admin');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize Firebase Admin SDK using environment variables.
// Download your service account key from:
// Firebase Console -> Project Settings -> Service Accounts -> Generate new private key
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

let credential;

if (serviceAccountPath) {
  const resolvedServiceAccountPath = path.resolve(
    __dirname,
    '..',
    serviceAccountPath
  );

  credential = admin.credential.cert(require(resolvedServiceAccountPath));
} else {
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ];

  const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing Firebase configuration: ${missingEnvVars.join(', ')}. Set GOOGLE_APPLICATION_CREDENTIALS or check backend/.env.`
    );
  }

  credential = admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  });
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential,
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
