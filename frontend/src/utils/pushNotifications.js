import { getToken } from 'firebase/messaging';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, messaging, vapidKey } from '../firebase';
import { FIRESTORE_COLLECTIONS } from '../firestoreModel';

export async function getPushTokenDocId(userId, token) {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return `${userId}_${token.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  }

  const encodedToken = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedToken);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const tokenHash = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${userId}_${tokenHash}`;
}

export async function registerBrowserPushToken(user, role) {
  if (!db) {
    throw new Error('Firestore is not configured.');
  }

  if (!vapidKey) {
    throw new Error('Missing VITE_FIREBASE_VAPID_KEY. Add the Firebase Web Push certificate key first.');
  }

  const messagingInstance = await messaging;
  if (!messagingInstance) {
    throw new Error('Firebase Messaging is not supported in this browser.');
  }

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  const token = await getToken(messagingInstance, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    throw new Error('Firebase did not return a push token for this browser.');
  }

  const tokenDocId = await getPushTokenDocId(user.uid, token);
  await setDoc(
    doc(db, FIRESTORE_COLLECTIONS.pushTokens, tokenDocId),
    {
      userId: user.uid,
      token,
      role,
      userAgent: navigator.userAgent,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return token;
}
