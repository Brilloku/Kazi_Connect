/**
 * Real-time Context for Kazilink
 * Manages real-time notifications and events from Supabase
 * Handles toast notifications and unread count tracking
 */

import React, { createContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { subscribeToRealtimeEvents, unsubscribeRealtime } from '../utils/realtime';

// Default context value
export const RealtimeContext = createContext({
  events: [],
  unreadCount: 0,
  markAllRead: () => {},
});

export const RealtimeProvider = ({ children }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);      // Array of real-time events
  const [unreadCount, setUnreadCount] = useState(0); // Number of unread notifications

  useEffect(() => {
    if (!user) {
      // Clean up state when user logs out
      setEvents([]);
      setUnreadCount(0);
      return;
    }

    /**
     * Subscribe to real-time events for the current user
     * Sets up Supabase subscription and event handler
     */
    const ch = subscribeToRealtimeEvents(user._id, (record) => {
      // Add new event to the beginning of events array (keep max 50)
      setEvents(prev => [record, ...prev].slice(0, 50));

      // Increment unread count
      setUnreadCount(c => c + 1);

      // Show toast notification based on event type
      try {
        const type = record.type || 'notification';
        if (type === 'chat:new-message') {
          // Special handling for chat messages
          toast.info(`Chat: ${record.payload?.message || 'New message'}`);
        } else {
          // Format task-related notifications
          const title = type.replace('task:', '').replace('-', ' ');
          toast.info(`${title}: ${record.payload?.message || 'You have a new event'}`);
        }
      } catch (err) {
        console.warn('Realtime toast error', err);
      }
    });

    // Cleanup subscription on unmount or user change
    return () => {
      if (ch) unsubscribeRealtime(ch);
    };
  }, [user]);

  /**
   * Mark all notifications as read
   * Resets the unread count to zero
   */
  const markAllRead = () => {
    setUnreadCount(0);
  };

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ events, unreadCount, markAllRead }), [events, unreadCount]);

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

export default RealtimeProvider;
