import React from 'react';
import { 
  BellIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ChatBubbleLeftIcon, 
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const NotificationIcon = ({ type, className = "w-6 h-6" }) => {
  const getIcon = () => {
    switch (type) {
      case 'task_assigned':
        return <DocumentTextIcon className={`${className} text-blue-500`} />;
      case 'application_accepted':
        return <CheckCircleIcon className={`${className} text-green-500`} />;
      case 'application_rejected':
        return <XCircleIcon className={`${className} text-red-500`} />;
      case 'new_comment':
        return <ChatBubbleLeftIcon className={`${className} text-purple-500`} />;
      case 'project_update':
        return <ExclamationTriangleIcon className={`${className} text-yellow-500`} />;
      case 'user_mention':
        return <UserIcon className={`${className} text-indigo-500`} />;
      default:
        return <BellIcon className={`${className} text-gray-500`} />;
    }
  };

  return getIcon();
};

export default NotificationIcon; 