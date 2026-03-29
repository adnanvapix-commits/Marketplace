-- Fix messages RLS to allow verified+subscribed users to send messages
-- Run in Supabase SQL Editor

-- Drop old restrictive policy
drop policy if exists "Authenticated users can send messages" on public.messages;

-- New policy: allow any authenticated user to insert (sender_id must match auth.uid)
create policy "Authenticated users can send messages" on public.messages
  for insert with check (auth.uid() = sender_id);

-- Also allow reading messages for participants
drop policy if exists "Users can view their own messages" on public.messages;

create policy "Users can view their own messages" on public.messages
  for select using (
    auth.uid() = sender_id or auth.uid() = receiver_id
  );
