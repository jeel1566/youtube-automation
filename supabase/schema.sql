-- Create table for video queue
create table public.video_queue (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  youtube_url text not null,
  custom_description text,
  status text default 'pending' check (status in ('pending', 'processing', 'done', 'failed')),
  original_channel_id text,
  video_title text,
  thumbnail_url text,
  error_message text
);

-- Create table for history to prevent duplicates
create table public.history (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  video_id text not null unique, -- YouTube Video ID
  processed_at timestamp with time zone
);

-- Enable Row Level Security (RLS)
alter table public.video_queue enable row level security;
alter table public.history enable row level security;

-- Create policy to allow anonymous access (since it's an internal tool with access code, or we can just open it for now)
-- For simplicity in this prototype, we'll allow all access but in production we'd use auth.
create policy "Allow public access" on public.video_queue for all using (true);
create policy "Allow public access" on public.history for all using (true);
