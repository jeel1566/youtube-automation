<div align="center">

# 🎬 YouTube Automation Hub

### *A "Headless" automation tool to download videos from YouTube and repost them to your channel*

![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)
![Built by](https://img.shields.io/badge/Built%20by-One%20Person-blue.svg)
![Serverless](https://img.shields.io/badge/100%25-Serverless-green.svg)
![Free Tier](https://img.shields.io/badge/Cost-$0-brightgreen.svg)

---

### 👤 **Solo Developer Project**
> This entire project is designed, built, and maintained by **one person**. It's optimized for individual creators who want to automate their YouTube content workflow without managing servers or paying for expensive infrastructure.

</div>

---

## ✨ Features

🎯 **Queue Management** - Add multiple YouTube videos to download and repost  
⚡ **Automated Processing** - GitHub Actions worker runs every 6 hours  
🔄 **OAuth Integration** - Secure YouTube authentication  
💾 **Database Powered** - Supabase for reliable queue management  
🎨 **Modern UI** - Clean React interface built with Vite  
💰 **100% Free** - Runs entirely on free tiers (Vercel + Supabase + GitHub Actions)

---

## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │ ───▶ │   Database      │ ◀─── │    Worker       │
│  Vite + React   │      │    Supabase     │      │ GitHub Actions  │
│   (Vercel)      │      │   (Free Tier)   │      │   (Free Tier)   │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

**Tech Stack:**
- 🎨 **Frontend**: Vite + React → Hosted on Vercel
- 💾 **Database**: Supabase (PostgreSQL)
- 🤖 **Worker**: GitHub Actions (Automated Background Jobs)
- 🎥 **API**: YouTube Data API v3

---

## 🚀 Quick Start

<details>
<summary><b>📋 Prerequisites</b></summary>

Before you begin, make sure you have:
- [ ] A GitHub account
- [ ] A Supabase account (free)
- [ ] A Vercel account (free)
- [ ] A Google Cloud Project with YouTube Data API enabled
- [ ] OAuth credentials for YouTube

</details>

<details open>
<summary><b>🔧 Step 1: Supabase Setup (Database)</b></summary>

1. Create a new project on [Supabase](https://supabase.com)
2. Navigate to **SQL Editor**
3. Copy and run the content from `supabase/schema.sql`
4. Go to **Project Settings → API**
5. Copy your `URL` and `anon public` key
6. Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

</details>

<details open>
<summary><b>⚙️ Step 2: GitHub Configuration (Worker)</b></summary>

1. Push this code to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Add the following **Repository Secrets**:
   
   | Secret Name | Description |
   |------------|-------------|
   | `SUPABASE_URL` | Your Supabase project URL |
   | `SUPABASE_KEY` | Your Supabase anon/public key |
   | `YOUTUBE_CLIENT_ID` | Google Cloud OAuth Client ID |
   | `YOUTUBE_CLIENT_SECRET` | Google Cloud OAuth Client Secret |
   | `YOUTUBE_REFRESH_TOKEN` | YouTube OAuth refresh token |

</details>

<details open>
<summary><b>🚢 Step 3: Vercel Deployment (Frontend)</b></summary>

1. Import your GitHub repository into [Vercel](https://vercel.com)
2. Add environment variables in the Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Click **Deploy**! 🎉

</details>

---

## 📖 How to Use

1. **🌐 Open your deployed Vercel app**
2. **📝 Paste YouTube video links** into the interface
3. **✅ Submit to queue** - Videos are added to your download queue
4. **⏰ Sit back and relax** - GitHub Actions automatically processes the queue every 6 hours
5. **🎬 Videos get uploaded** to your YouTube channel automatically

> 💡 **Pro Tip**: You can manually trigger the worker from the **Actions** tab in your GitHub repository if you don't want to wait!

---

## 🎯 Project Philosophy

### Why One Person Can Build This:

This project demonstrates that **modern serverless architecture empowers solo developers** to build production-grade automation tools without:
- Managing servers 🚫
- Paying for infrastructure 💸
- Complex DevOps setups ⚙️
- Large teams 👥

By leveraging free tiers of powerful platforms (Vercel, Supabase, GitHub Actions), a single developer can create, deploy, and maintain robust automation systems.

---

## 📂 Project Structure

```
youtube-automation-hub/
├── 📁 src/              # React frontend source code
├── 📁 supabase/         # Database schema and migrations
├── 📁 .github/
│   └── 📁 workflows/    # GitHub Actions worker scripts
├── 📄 README.md         # You are here!
└── 📄 package.json      # Dependencies
```

---

## 🤝 Contributing

While this is a **solo project**, I welcome:
- 🐛 Bug reports
- 💡 Feature suggestions
- ⭐ Stars (they make my day!)

---

## 📜 License

MIT License - Feel free to use this for your own projects!

---

## 💬 Questions?

Built something cool with this? Have questions? Feel free to open an issue!

---

<div align="center">

**⭐ If this helped you, consider starring the repo! ⭐**

*Built with 💜 by a solo developer*

</div>
