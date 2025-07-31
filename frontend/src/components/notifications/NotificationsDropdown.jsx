import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  fetchNotifications, 
  readNotification, 
  readAllNotifications,
  addNotification 
} from '../../store/slices/notificationSlice';
import { subscribeToNotifications } from '../../api/notification';
import NotificationIcon from './NotificationIcon';
import { 
  BellIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { notifications, unreadCount, loading } = useSelector(state => state.notifications);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, user]);

  // Debug: Log notifications whenever they change
  useEffect(() => {
    console.log('Notifications fetched:', notifications);
  }, [notifications]);

  useEffect(() => {
    // Set up real-time notifications
    if (user) {
      const unsubscribe = subscribeToNotifications((newNotification) => {
        dispatch(addNotification(newNotification));
      });
      return unsubscribe;
    }
  }, [dispatch, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      dispatch(fetchNotifications());
    }
  };

  const handleMarkAsRead = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await dispatch(readNotification(notificationId)).unwrap();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsLoading(true);
      await dispatch(readAllNotifications()).unwrap();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.is_read) {
      dispatch(readNotification(notification.id));
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'task_assigned':
        navigate(`/dashboard/tasks/${notification.entity_id}`);
        break;
      case 'application_accepted':
      case 'application_rejected':
        navigate(`/projects/${notification.entity_id}`);
        break;
      case 'new_comment':
        navigate(`/dashboard/tasks/${notification.entity_id}`);
        break;
      default:
        navigate('/dashboard');
    }
    
    setIsOpen(false);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const formatExactDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata'
    });
  };

  const getNotificationTitle = (notification) => {
    switch (notification.type) {
      case 'task_assigned':
        return 'Task Assigned';
      case 'application_accepted':
        return 'Application Accepted';
      case 'application_rejected':
        return 'Application Update';
      case 'new_comment':
        return 'New Comment';
      case 'project_update':
        return 'Project Update';
      case 'user_mention':
        return 'You were mentioned';
      default:
        return 'Notification';
    }
  };

  const parseNotificationMessage = (notification) => {
    if (["application_accepted", "application_rejected"].includes(notification.type)) {
      try {
        return JSON.parse(notification.message);
      } catch {
        return { text: notification.message };
      }
    }
    return { text: notification.message };
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="relative flex items-center justify-center w-10 h-10 p-0 rounded-full focus:outline-none"
        aria-label="Notifications"
      >
        <BellIcon className="w-7 h-7 text-indigo-700 dark:text-indigo-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Custom Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 max-w-xs max-h-[500px] bg-white dark:bg-indigo-950 text-black dark:text-white rounded-xl shadow-2xl border border-gray-100 dark:border-indigo-800 z-50 flex flex-col"
          style={{ minWidth: 320 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-indigo-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Marking...' : 'Mark all read'}
                </button>
              )}
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setIsOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <BellIcon className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-indigo-800">
                {notifications.map((notification) => {
                  const msg = parseNotificationMessage(notification);
                  return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-indigo-900 cursor-pointer transition-colors duration-150 flex items-center gap-3
                        ${!notification.is_read ? 'bg-blue-50 dark:bg-indigo-800 border-l-4 border-blue-500 dark:border-indigo-400' : ''}
                      ${notification.type === 'application_accepted' ? 'border-l-4 border-green-500' : ''}
                      ${notification.type === 'application_rejected' ? 'border-l-4 border-red-500' : ''}`}
                  >
                    <NotificationIcon type={notification.type} className="w-7 h-7 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold">{getNotificationTitle(notification)}</div>
                        <div className="text-sm text-gray-700 dark:text-gray-200">
                          {['application_accepted', 'application_rejected'].includes(notification.type) ? (
                            <>
                              <div>{msg.text}</div>
                              {msg.projectTitle && (
                                <div className="mt-0.5">
                                  <b>Project:</b>{' '}
                                  <span
                                    className="font-bold text-indigo-700 dark:text-indigo-300 cursor-pointer hover:underline"
                                    onClick={e => {
                                      e.stopPropagation();
                                      navigate(msg.link || `/dashboard/projects/${notification.entity_id}`);
                                      setIsOpen(false);
                                    }}
                                  >
                                    {msg.projectTitle}
                          </span>
                                </div>
                        )}
                              {msg.companyName && (
                                <div className="mt-0.5"><b>Company:</b> {msg.companyName}</div>
                              )}
                              {msg.feedback && (
                                <div className="mt-0.5"><b>Feedback:</b> <span className="italic">{msg.feedback}</span></div>
                              )}
                              <div className="text-xs text-gray-400 mt-1">
                                <b>Applied at:</b> {formatExactDateTime(notification.created_at)}
                              </div>
                            </>
                          ) : (
                          notification.message
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{formatTimeAgo(notification.created_at)}</div>
                    </div>
                    {['application_accepted', 'application_rejected'].includes(notification.type) && (
                      <button
                        className="ml-2 px-3 py-1 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-semibold"
                        onClick={e => {
                          e.stopPropagation();
                            navigate(msg.link || `/dashboard/projects/${notification.entity_id}`);
                          setIsOpen(false);
                        }}
                      >
                        Go to Project
                      </button>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </div>
            </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;