const db = require('../config/db');

const createNotification = async (recipientId, senderId, type, message, entityType, entityId) => {
  try {
    console.log('Creating notification:', { recipientId, type, message });
    const notification = await db.query(
      `INSERT INTO notifications 
       (recipient_id, sender_id, type, message, entity_type, entity_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [recipientId, senderId, type, message, entityType, entityId]
    );
    
    return notification.rows[0];
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

const getUserNotifications = async (userId, limit = 20, offset = 0) => {
  try {
    const notifications = await db.query(
      `SELECT 
        n.*,
        u.email as sender_email, 
        up.name as sender_name,
        up.photo as sender_photo
       FROM notifications n
       LEFT JOIN users u ON n.sender_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE n.recipient_id = $1
       ORDER BY n.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    
    const total = await db.query(
      'SELECT COUNT(*) FROM notifications WHERE recipient_id = $1',
      [userId]
    );

    const unreadCount = await db.query(
      'SELECT COUNT(*) FROM notifications WHERE recipient_id = $1 AND is_read = FALSE',
      [userId]
    );
    
    return {
      notifications: notifications.rows,
      total: parseInt(total.rows[0].count),
      unreadCount: parseInt(unreadCount.rows[0].count)
    };
  } catch (error) {
    console.error('Get notifications error:', error);
    throw error;
  }
};

const markAsRead = async (notificationId, userId) => {
  try {
    // Verify ownership
    const notification = await db.query(
      'SELECT * FROM notifications WHERE id = $1 AND recipient_id = $2',
      [notificationId, userId]
    );
    
    if (notification.rows.length === 0) {
      throw new Error('Notification not found or unauthorized');
    }
    
    const updated = await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *',
      [notificationId]
    );
    
    return updated.rows[0];
  } catch (error) {
    console.error('Mark as read error:', error);
    throw error;
  }
};

// Helper function to create specific notification types
const createTaskAssignedNotification = async (recipientId, senderId, taskId, taskTitle) => {
  return createNotification(
    recipientId,
    senderId,
    'task_assigned',
    `You have been assigned a new task: ${taskTitle}`,
    'task',
    taskId
  );
};

const createApplicationStatusNotification = async (recipientId, senderId, projectId, projectTitle, status, companyName, feedback) => {
  // Enhanced message as JSON string
  const messageObj = {
    projectTitle,
    companyName,
    feedback,
    link: `/dashboard/projects/${projectId}`,
    text: status === 'accepted'
      ? `Congratulations! Your application for "${projectTitle}" at "${companyName}" has been accepted.`
      : `Your application for "${projectTitle}" at "${companyName}" was not selected.`
  };
  return createNotification(
    recipientId,
    senderId,
    `application_${status}`,
    JSON.stringify(messageObj),
    'project',
    projectId
  );
};

const createCommentNotification = async (recipientId, senderId, taskId, taskTitle) => {
  return createNotification(
    recipientId,
    senderId,
    'new_comment',
    `New comment on task: ${taskTitle}`,
    'task',
    taskId
  );
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  createTaskAssignedNotification,
  createApplicationStatusNotification,
  createCommentNotification
};