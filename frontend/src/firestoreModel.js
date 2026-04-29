export const FIRESTORE_COLLECTIONS = {
  trips: 'trips',
  vehicles: 'vehicles',
  rideRequests: 'rideRequests',
  notifications: 'notifications',
  pushTokens: 'pushTokens',
  users: 'users',
  reports: 'reports',
  auditLogs: 'auditLogs',
};

export const TRIP_STATUS = {
  active: 'active',
  full: 'full',
  cancelled: 'cancelled',
};

export const RIDE_REQUEST_STATUS = {
  pending: 'pending',
  approved: 'approved',
  declined: 'declined',
  cancelled: 'cancelled',
};

export const NOTIFICATION_STATUS = {
  unread: 'unread',
  read: 'read',
};
