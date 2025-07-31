import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../api/notification';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getNotifications();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch notifications' });
    }
  }
);

export const readNotification = createAsyncThunk(
  'notifications/readNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await markNotificationAsRead(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to mark notification as read' });
    }
  }
);

export const readAllNotifications = createAsyncThunk(
  'notifications/readAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      await markAllNotificationsAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to mark all notifications as read' });
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    addNotification: (state, action) => {
      // Check if notification already exists
      const exists = state.notifications.find(n => n.id === action.payload.id);
      if (!exists) {
        state.notifications.unshift(action.payload);
        state.unreadCount += 1;
      }
    },
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount || 0;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch notifications';
      })
      .addCase(readNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(readNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, is_read: true }
            : notification
        );
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(readNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to mark notification as read';
      })
      .addCase(readAllNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(readAllNotifications.fulfilled, (state) => {
        state.loading = false;
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          is_read: true,
        }));
        state.unreadCount = 0;
      })
      .addCase(readAllNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to mark all notifications as read';
      });
  },
});

export const { addNotification, updateUnreadCount, clearError } = notificationSlice.actions;
export default notificationSlice.reducer;