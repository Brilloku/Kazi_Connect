import React, { createContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { subscribeToRealtimeEvents, unsubscribeRealtime } from '../utils/realtime';

export const RealtimeContext = createContext({
  events: [],
  unreadCount: 0,
  markAllRead: () => {},
});

export const RealtimeProvider = ({ children }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!user) {
      // cleanup when logged out
      setEvents([]);
      setUnreadCount(0);
      return;
    }

    // subscribe for this user
    const ch = subscribeToRealtimeEvents(user._id, (record) => {
      setEvents(prev => [record, ...prev].slice(0, 50));
      setUnreadCount(c => c + 1);
      // show a toast notification
      try {
        const type = record.type || 'notification';
        if (type === 'chat:new-message') {
          // Special handling for chat messages - only show if relevant to current user
          // For now, show all chat notifications (can be filtered later based on task ownership)
          toast.info(`Chat: ${record.payload?.message || 'New message'}`);
        } else {
          const title = type.replace('task:', '').replace('-', ' ');
          toast.info(`${title}: ${record.payload?.message || 'You have a new event'}`);
        }
      } catch (err) {
        console.warn('Realtime toast error', err);
      }
    });

    return () => {
      if (ch) unsubscribeRealtime(ch);
    };
  }, [user]);

  const markAllRead = () => {
    setUnreadCount(0);
  };

  const value = useMemo(() => ({ events, unreadCount, markAllRead }), [events, unreadCount]);

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

export default RealtimeProvider;
