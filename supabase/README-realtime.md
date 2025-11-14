Supabase realtime_events setup
===============================

This document explains how to create and use the `realtime_events` table in Supabase for app-level realtime notifications.

1) Create the table
- Open your Supabase project -> SQL editor.
- Run the SQL in `supabase/realtime_events.sql` included in this repository. That will create the `realtime_events` table and helpful indexes.

2) Environment variables required in your app
- Frontend (React):
  - `REACT_APP_SUPABASE_URL` — your Supabase project URL
  - `REACT_APP_SUPABASE_ANON_KEY` — anon/public key for client subscriptions

- Backend (server):
  - `SUPABASE_SERVICE_ROLE_KEY` — service role key (server-only). Use this to insert rows or query Supabase securely.

3) Subscribe from the frontend
- The frontend can subscribe to the `realtime_events` table (INSERT events) using the Supabase client. The app already contains a `RealtimeProvider` that subscribes for the authenticated user and displays toasts.

4) Publishing events
- When your backend performs actions (task created/applied/assigned/completed), insert a row into `realtime_events` with a suitable `type` and `payload`. Example types:
  - `task:created`
  - `task:applied`
  - `task:assigned`
  - `task:completed`

Example server-side (Node) using `@supabase/supabase-js` service role client:

```js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

await supabase.from('realtime_events').insert([{
  type: 'task:applied',
  payload: { message: 'Jane applied to your task', applicantId: 'user_abc' },
  task_id: 'task_123',
  target_user_id: 'client_mongo_id_or_user_identifier'
}]);
```

Notes:
- `target_user_id` can be used to target a specific user; if `NULL`, treat as a global/broadcast event.
- For security, limit who can insert or read events on the DB. Start with server-side filtering (insert events only from backend). For production, consider enabling RLS and policies so clients can only `select` events addressed to them.

5) Testing
- After creating the table, open the Supabase SQL editor and run an INSERT (see `realtime_events.sql` example). The `RealtimeProvider` in the frontend should pick up the new event and surface a toast / update the notifications bell.

6) Pruning
- Consider adding a scheduled job to prune events older than 7–30 days to avoid unbounded growth.

If you want, I can also:
- Add server-side publishing into `backend/routes/tasks.js` so task endpoints automatically insert events. (I can implement this next.)
- Add a small SQL function or Supabase scheduled job template to prune old events.
