import os
import time
import subprocess
import re
import json
from dotenv import load_dotenv
from supabase import create_client, Client
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# Load environment variables from .env file
load_dotenv()

# Configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
YOUTUBE_CLIENT_ID = os.environ.get("YOUTUBE_CLIENT_ID")
YOUTUBE_CLIENT_SECRET = os.environ.get("YOUTUBE_CLIENT_SECRET")
YOUTUBE_REFRESH_TOKEN = os.environ.get("YOUTUBE_REFRESH_TOKEN")

if not all([SUPABASE_URL, SUPABASE_KEY, YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN]):
    print("Missing environment variables")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_youtube_service():
    creds = Credentials(
        None,
        refresh_token=YOUTUBE_REFRESH_TOKEN,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=YOUTUBE_CLIENT_ID,
        client_secret=YOUTUBE_CLIENT_SECRET
    )
    return build("youtube", "v3", credentials=creds)

def extract_video_id(url):
    """Extract YouTube video ID from various URL formats"""
    patterns = [
        r'(?:youtube\.com/watch\?v=|youtu\.be/)([\w-]{11})',
        r'youtube\.com/shorts/([\w-]{11})',
        r'youtube\.com/embed/([\w-]{11})'
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def get_video_info(url):
    """Fetch video title and ID using yt-dlp"""
    try:
        cmd = ["yt-dlp", "--print", "%(id)s|||%(title)s", "--no-playlist", url]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        video_id, title = result.stdout.strip().split("|||")
        return video_id, title
    except Exception as e:
        print(f"Error fetching video info: {e}")
        # Fallback to regex extraction
        video_id = extract_video_id(url)
        return video_id, f"Video {video_id or 'Unknown'}"

def download_video(url, output_path):
    print(f"Downloading {url}...")
    # Use yt-dlp with options to bypass bot detection
    cmd = [
        "yt-dlp",
        "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "--extractor-args", "youtube:player_client=web",
        "--cookies-from-browser", "chrome",  # Try to use cookies
        "--retries", "3",
        "--fragment-retries", "3",
        "-o", output_path,
        "--no-playlist",
        url
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        error_msg = result.stderr if result.stderr else result.stdout
        print(f"yt-dlp error: {error_msg}")
        raise Exception(f"yt-dlp failed: {error_msg[:200]}")  # Truncate to first 200 chars

def upload_video(youtube, file_path, title, description):
    print(f"Uploading {title}...")
    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": ["automation"],
            "categoryId": "22" # People & Blogs
        },
        "status": {
            "privacyStatus": "private" # Upload as private first for safety
        }
    }
    
    media = MediaFileUpload(file_path, chunksize=-1, resumable=True)
    request = youtube.videos().insert(
        part="snippet,status",
        body=body,
        media_body=media
    )
    
    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            print(f"Uploaded {int(status.progress() * 100)}%")
    
    print("Upload Complete!")
    return response

def process_queue():
    # Fetch pending videos
    response = supabase.table("video_queue").select("*").eq("status", "pending").limit(1).execute()
    videos = response.data
    
    if not videos:
        print("No pending videos")
        return

    youtube = get_youtube_service()
    
    for video in videos:
        queue_id = video["id"]
        url = video["youtube_url"]
        desc = video["custom_description"] or "Uploaded via Automation"
        
        print(f"Processing {queue_id}: {url}")
        
        # Update status to processing
        supabase.table("video_queue").update({"status": "processing"}).eq("id", queue_id).execute()
        
        try:
            # Get video info
            yt_video_id, title = get_video_info(url)
            
            if not yt_video_id:
                raise ValueError("Could not extract video ID from URL")
            
            # Check if already processed
            history_check = supabase.table("history").select("*").eq("video_id", yt_video_id).execute()
            if history_check.data:
                print(f"Video {yt_video_id} already processed. Skipping.")
                supabase.table("video_queue").update({"status": "done", "error_message": "Already processed"}).eq("id", queue_id).execute()
                continue
            
            filename = "downloaded_video.mp4"
            if os.path.exists(filename):
                os.remove(filename)
                
            download_video(url, filename)
            
            upload_video(youtube, filename, title, desc)
            
            # Update status to done
            supabase.table("video_queue").update({"status": "done"}).eq("id", queue_id).execute()
            
            # Add to history
            supabase.table("history").insert({"video_id": yt_video_id}).execute()
            
        except Exception as e:
            error_msg = str(e)
            print(f"Error: {error_msg}")
            supabase.table("video_queue").update({"status": "failed", "error_message": error_msg}).eq("id", queue_id).execute()
        finally:
            if os.path.exists(filename):
                os.remove(filename)

if __name__ == "__main__":
    process_queue()
