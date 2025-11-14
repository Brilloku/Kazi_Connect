-- Add sender_name and sender_avatar columns to chat_messages if they don't exist
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS sender_name text,
  ADD COLUMN IF NOT EXISTS sender_avatar text;

-- Optional: backfill sender_name/avatar from joined chat_users if you want
-- Example (run carefully):
-- UPDATE public.chat_messages m
-- SET sender_name = u.name, sender_avatar = u.avatar_url
-- FROM public.chat_users u
-- WHERE m.sender_id = u.id AND (m.sender_name IS NULL OR m.sender_name = '');
