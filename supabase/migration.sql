-- Migration: Add error_message column to existing video_queue table
ALTER TABLE public.video_queue ADD COLUMN IF NOT EXISTS error_message text;
