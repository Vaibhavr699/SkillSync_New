import api from './api';

export const getNotifications = async (limit = 20, offset = 0) => {
  try {
    const response = await api.get(`/notifications?limit=${limit}&offset=${offset}`);
    return response.data;
  } catch (error) {
    console.error('Get notifications error:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Mark notification as read error:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.put('/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    throw error;
  }
};

// Real-time notification support (WebSocket)
export const subscribeToNotifications = (callback) => {
  // For now, we'll use polling. WebSocket can be implemented later
  const interval = setInterval(async () => {
    try {
      const response = await getNotifications(1, 0); // Get latest notification
      if (response.notifications && response.notifications.length > 0) {
        const latestNotification = response.notifications[0];
        const lastCheck = localStorage.getItem('lastNotificationCheck');
        const lastCheckTime = lastCheck ? new Date(lastCheck).getTime() : 0;
        
        if (new Date(latestNotification.created_at).getTime() > lastCheckTime) {
          callback(latestNotification);
          localStorage.setItem('lastNotificationCheck', new Date().toISOString());
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, 10000); // Poll every 10 seconds

  return () => clearInterval(interval);
};