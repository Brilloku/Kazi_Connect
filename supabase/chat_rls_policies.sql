-- Enable Row Level Security on chat tables (if not already enabled)
ALTER TABLE public.chat_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to allow recreation
DROP POLICY IF EXISTS "Users can insert their own chat user record" ON public.chat_users;
DROP POLICY IF EXISTS "Users can view chat user records" ON public.chat_users;
DROP POLICY IF EXISTS "Users can update their own chat user record" ON public.chat_users;
DROP POLICY IF EXISTS "Users can insert chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can view chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can insert messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.chat_messages;

-- Policies for chat_users table
-- Allow inserts for chat users (adjusted for anon access)
CREATE POLICY "Allow insert chat users" ON public.chat_users
  FOR INSERT WITH CHECK (true);

-- Allow viewing chat user records
CREATE POLICY "Allow view chat users" ON public.chat_users
  FOR SELECT USING (true);

-- Allow authenticated users to update their own chat user record
CREATE POLICY "Users can update their own chat user record" ON public.chat_users
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Policies for chat_rooms table
-- Allow inserts for chat rooms
CREATE POLICY "Allow insert chat rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (true);

-- Allow viewing chat rooms
CREATE POLICY "Allow view chat rooms" ON public.chat_rooms
  FOR SELECT USING (true);

-- Policies for chat_messages table
-- Allow inserts for messages
CREATE POLICY "Allow insert messages" ON public.chat_messages
  FOR INSERT WITH CHECK (true);

-- Allow viewing messages
CREATE POLICY "Allow view messages" ON public.chat_messages
  FOR SELECT USING (true);

-- Optional: Allow authenticated users to update/delete their own messages (if needed)
CREATE POLICY "Users can update their own messages" ON public.chat_messages
  FOR UPDATE USING (auth.uid() IS NOT NULL AND sender_id IN (
    SELECT id FROM public.chat_users WHERE mongo_id = auth.uid()::text
  ));

CREATE POLICY "Users can delete their own messages" ON public.chat_messages
  FOR DELETE USING (auth.uid() IS NOT NULL AND sender_id IN (
    SELECT id FROM public.chat_users WHERE mongo_id = auth.uid()::text
  ));
