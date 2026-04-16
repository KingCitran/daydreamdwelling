-- User feedback / bug reports submitted from the floating feedback button
create table if not exists public.feedback (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete set null,
  email       text,
  type        text not null default 'feedback', -- 'bug', 'idea', 'feedback', 'complaint'
  message     text not null,
  page_url    text,
  user_agent  text,
  status      text not null default 'open',     -- 'open', 'reviewing', 'resolved', 'wontfix'
  admin_notes text,
  created_at  timestamptz not null default now()
);

alter table public.feedback enable row level security;

-- Anyone (including anon) can submit feedback
do $$ begin
  create policy "anyone_submit_feedback" on public.feedback for insert with check (true);
exception when duplicate_object then null;
end $$;

-- Users can see their own feedback
do $$ begin
  create policy "users_read_own_feedback" on public.feedback for select using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
