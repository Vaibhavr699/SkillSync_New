import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import store from '../store/store';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications } from '../store/slices/notificationSlice';
import { toast } from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    let token = store.getState()?.auth?.token;
    if (!token) {
      const persisted = localStorage.getItem('auth');
      if (persisted) {
        try {
          token = JSON.parse(persisted).token;
        } catch {}
      }
    }
    let apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl.endsWith('/api')) apiUrl = apiUrl.slice(0, -4);
    const newSocket = io(apiUrl, {
      auth: { token },
    });
    setSocket(newSocket);

    // Register user for targeted notifications
    if (user?.id) {
      newSocket.emit('register', user.id);
    }

    // Listen for notification events
    newSocket.on('notification', (notification) => {
      dispatch(fetchNotifications());
      toast.success('You have a new notification!');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, dispatch]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};