const db = require('../config/db');

async function createNotification(recipientId, senderId, type, message, entityType, entityId) {
  await db.query(
    `INSERT INTO notifications (recipient_id, sender_id, type, message, entity_type, entity_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [recipientId, senderId, type, message, entityType, entityId]
  );
}

module.exports = createNotification; 