-- Create a lightweight events table for app realtime notifications
-- Run this in the Supabase SQL editor (SQL tab) for your project

-- Requires the pgcrypto extension for gen_random_uuid(); Supabase projects usually have this enabled.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.realtime_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  payload jsonb,
  task_id text,
  target_user_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_realtime_events_target_user ON public.realtime_events (target_user_id);
CREATE INDEX IF NOT EXISTS idx_realtime_events_task ON public.realtime_events (task_id);

-- Optionally set replica identity if you plan to use fine-grained replication triggers
-- (Supabase realtime typically works with WAL-based replication; this is a safe default)
ALTER TABLE public.realtime_events REPLICA IDENTITY FULL;

-- Example insertion (run in SQL editor to test the table):
-- INSERT INTO public.realtime_events (type, payload, task_id, target_user_id) VALUES
-- ('task:created', '{"message": "New task created", "taskTitle": "Fix plumbing"}'::jsonb, 'task_123', null);
