# Implementation Plan - YouTube Automation Hub

This project is a web-based tool to automate downloading videos from YouTube and reposting them to your own channel. It is designed to run entirely on free-tier infrastructure (Vercel, Supabase, GitHub Actions).

## User Review Required

> [!IMPORTANT]
> **YouTube API Quotas**: The default quota is 10,000 units/day. Uploading a video costs 1,600 units. You are limited to **~6 uploads per day** unless you request a quota increase from Google.

> [!WARNING]
> **Secrets Management**: You will need to generate a YouTube `refresh_token` locally once and save it to GitHub Secrets. This allows the automated worker to upload videos on your behalf without you logging in every time.

## Proposed Architecture

### 1. The Brain: Vite + React Web App (Vercel)
- **UI**: A clean dashboard to manage the queue.
    - **Add Videos**: A text area to paste 1-15 links (Batch Mode).
    - **Channel Monitor**: Input a channel handle to fetch recent videos and compare with history.
    - **Queue View**: See what is waiting to be processed.
- **Backend**: Vercel Serverless Functions (`/api`) to interact with Supabase and GitHub.

### 2. The Memory: Supabase (Database)
- **Table `video_queue`**: Stores videos waiting to be processed.
    - Columns: `id`, `youtube_url`, `custom_description`, `status` (pending, processing, done, failed), `original_channel_id`.
- **Table `history`**: Stores IDs of videos we have already processed to prevent duplicates.

### 3. The Muscle: GitHub Actions (Worker)
- **Trigger**: Runs on a schedule (e.g., every 6 hours) OR can be manually triggered via the Web App (using GitHub Dispatch API).
- **Job**:
    1.  Connects to Supabase to get "pending" videos.
    2.  Uses `yt-dlp` to download the video.
    3.  Uses a Python script to upload to YouTube.
    4.  Updates Supabase status to "done".

## Proposed Changes

### Configuration
#### [NEW] [.env.local.example](file:///c:/Users/dell/Desktop/New%20folder%20(3)/.env.local.example)
- Environment variables for Supabase keys, GitHub Token (for dispatch), and YouTube credentials.

### Database (Supabase)
#### [NEW] [supabase/schema.sql](file:///c:/Users/dell/Desktop/New%20folder%20(3)/supabase/schema.sql)
- SQL definitions for `video_queue` and `history` tables.

### Frontend (Vite + React)
#### [NEW] [src/App.tsx](file:///c:/Users/dell/Desktop/New%20folder%20(3)/src/App.tsx)
- Main dashboard with tabs for "Manual Add" and "Channel Search".

#### [NEW] [api/add-to-queue.ts](file:///c:/Users/dell/Desktop/New%20folder%20(3)/api/add-to-queue.ts)
- Serverless function to validate inputs and insert into Supabase.

### Worker (GitHub Actions)
#### [NEW] [.github/workflows/process_queue.yml](file:///c:/Users/dell/Desktop/New%20folder%20(3)/.github/workflows/process_queue.yml)
- The workflow file defining the automation steps.

#### [NEW] [worker/worker.py](file:///c:/Users/dell/Desktop/New%20folder%20(3)/worker/worker.py)
- The main logic script: fetches from DB -> `yt-dlp` -> Uploads -> Updates DB.

## Verification Plan

### Automated Tests
- None planned for this prototype.

### Manual Verification
1.  **Database Setup**: Run SQL in Supabase SQL Editor.
2.  **Web App**: Deploy to Vercel, test adding 5 links. Check if they appear in Supabase `video_queue`.
3.  **Worker**: Manually trigger the GitHub Action. Verify it downloads the video and uploads it to the target channel.
