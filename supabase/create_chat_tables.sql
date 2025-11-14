-- Supabase SQL to create chat tables
-- Run this in Supabase SQL editor

-- Users table mirrors MongoDB user IDs
create table if not exists chat_users (
  id uuid primary key default gen_random_uuid(),
  mongo_id text not null unique,
  name text not null,
  avatar_url text
);

-- Ensure default is set for id column (in case table was created without it)
ALTER TABLE chat_users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Each task/job gets its own chat room
create table if not exists chat_rooms (
  id uuid primary key default gen_random_uuid(),
  task_id text not null unique,
  created_at timestamptz default now()
);

-- Messages table
create table if not exists chat_messages (
  id bigint primary key generated always as identity,
  room_id uuid references chat_rooms(id) on delete cascade,
  sender_id uuid references chat_users(id) on delete cascade,
  message text not null,
  sender_name text,
  sender_avatar text,
  created_at timestamptz default now()
);

-- Enable realtime (full replica identity so payload includes all columns)
alter table chat_messages replica identity full;

-- Optional index for room queries
create index if not exists idx_chat_messages_room_id on chat_messages(room_id);
