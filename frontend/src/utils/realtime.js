import { supabase } from '../lib/supabase';

// Subscribe to `realtime_events` table for a specific user (or global if userId is null)
// Returns the subscription object which can be passed to `unsubscribe`.
export function subscribeToRealtimeEvents(userId, onEvent) {
  // Build filter: if userId present, only events where target_user_id equals userId or null (global)
  const filter = userId ? `target_user_id=eq.${userId}` : '';

  // Use Supabase realtime subscription via channel
  const channel = supabase.channel('realtime_events_channel');

  const topic = `public:realtime_events`;

  channel.on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'realtime_events' },
    (payload) => {
      // If userId provided, allow events where target_user_id matches or is null/empty
      const record = payload.new || payload.record || payload;
      if (userId) {
        const target = record.target_user_id;
        if (target && target !== userId) return; // not for this user
      }
      onEvent(record);
    }
  ).subscribe();

  return channel;
}

export function unsubscribeRealtime(channel) {
  if (!channel) return;
  try {
    supabase.removeChannel(channel);
  } catch (err) {
    console.warn('Error removing realtime channel', err);
  }
}
