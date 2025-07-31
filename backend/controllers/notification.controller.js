const db = require('../config/db');
const { getUserNotifications, markAsRead } = require('../services/notification.service');

exports.getNotifications = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const userId = req.user.id;

    const { notifications, total, unreadCount } = await getUserNotifications(userId, limit, offset);
    res.status(200).json({ 
      notifications, 
      total, 
      unreadCount,
      unreadCount 
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await markAsRead(notificationId, userId);
    res.status(200).json(notification);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE recipient_id = $1',
      [userId]
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};