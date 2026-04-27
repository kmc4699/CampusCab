importScripts('https://www.gstatic.com/firebasejs/12.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.11.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBNEhmZLKRGZ5nhMQ_tScJdbe7WYF9lFcs',
  authDomain: 'campuscab-63e48.firebaseapp.com',
  projectId: 'campuscab-63e48',
  storageBucket: 'campuscab-63e48.firebasestorage.app',
  messagingSenderId: '344204067855',
  appId: '1:344204067855:web:25716e09e625c410c74f7a',
  measurementId: 'G-3P9VYMGDW4',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {};
  const data = payload.data || {};

  self.registration.showNotification(notification.title || 'New ride request', {
    body: notification.body || data.body || 'A passenger requested to join your trip.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: {
      url: data.url || '/',
      requestId: data.requestId || '',
      tripId: data.tripId || '',
    },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const existingClient = clientList.find((client) => client.url.includes(targetUrl));
      if (existingClient) return existingClient.focus();
      return clients.openWindow(targetUrl);
    }),
  );
});
