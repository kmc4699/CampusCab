const { db } = require('../config/firebaseConfig');

/**
 * Firestore Schema — messages sub-collection under tripListings
 * tripListings/{tripId}/messages/{messageId}
 * {
 *   messageId: string,
 *   senderId: string,
 *   content: string,
 *   timestamp: Timestamp,
 * }
 */

/**
 * POST /api/messages
 * 1. Verify the sender is a participant of the trip (driver or approved passenger)
 * 2. Write message document to Firestore
 * 3. Real-time delivery is handled client-side via Firestore onSnapshot listener
 */
const sendMessage = async (req, res) => {
  // TODO: implement sendMessage
};

/**
 * GET /api/messages/:tripId
 * 1. Fetch messages sub-collection for the given tripId, ordered by timestamp asc
 * 2. Return message list as JSON
 * Note: For real-time chat, the client should use Firestore onSnapshot directly
 */
const getMessages = async (req, res) => {
  // TODO: implement getMessages
};

module.exports = { sendMessage, getMessages };
