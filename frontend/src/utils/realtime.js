/**
 * Real-time utilities for Kazilink
 * Handles Supabase real-time subscriptions for notifications and events
 * Manages subscriptions to the realtime_events table
 */

import { supabase } from './supabase';

/**
 * Subscribe to real-time events for a specific user
 * Listens for INSERT events on the realtime_events table
 * @param {string|null} userId - User ID to filter events (null for all events)
 * @param {function} onEvent - Callback function called when new event is received
 * @returns {object} Supabase channel object for unsubscribing
 */
export function subscribeToRealtimeEvents(userId, onEvent) {
  // Build filter: if userId present, only events where target_user_id equals userId or null (global)
  const filter = userId ? `target_user_id=eq.${userId}` : '';

  // Create Supabase realtime channel
  const channel = supabase.channel('realtime_events_channel');

  // Subscribe to INSERT events on realtime_events table
  channel.on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'realtime_events'
    },
    (payload) => {
      // Extract the new record from the payload
      const record = payload.new || payload.record || payload;

      // If userId provided, filter events for this user or global events (null target)
      if (userId) {
        const target = record.target_user_id;
        if (target && target !== userId) return; // Skip events not for this user
      }

      // Call the event handler with the record
      onEvent(record);
    }
  ).subscribe();

  return channel;
}

/**
 * Unsubscribe from real-time events
 * Removes the Supabase channel subscription
 * @param {object} channel - Supabase channel object returned by subscribeToRealtimeEvents
 */
export function unsubscribeRealtime(channel) {
  if (!channel) return;

  try {
    // Remove the channel to stop receiving events
    supabase.removeChannel(channel);
  } catch (err) {
    console.warn('Error removing realtime channel', err);
  }
}
