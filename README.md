
# 🌸 Ottako-X Platform

Welcome to **Ottako-X** — The premier social stage for adult anime artwork, cosplay, and digital assets.

## ✨ About
Ottako-X has evolved from a simple gallery into a fully-featured **Social Media Platform**. It allows creators to upload, manage, and monetize their content while enabling fans to follow, chat, and interact in real-time. Built with a cyberpunk aesthetic, it prioritizes a premium user experience for high-resolution art and video consumption.

## 🚀 Key Features

### 🎨 **Immersive Gallery**
*   **Masonry Grid**: Optimized layout for mixed portrait/landscape artwork.
*   **Zoom & Pan**: Deep zoom capabilities for high-resolution illustrations.
*   **Video Support**: Native playback for AMVs and clips.
*   **Smart Filtering**: Filter by tags, categories, or search authors.

### 📁 **Google Drive Integration**
To add content from Google Drive to `gallery-data.ts`:
1.  Upload your file to Google Drive.
2.  Right-click the file > **Share** > **Share**.
3.  Under "General Access", change "Restricted" to **"Anyone with the link"**.
4.  Click **Copy Link**.
5.  Paste this link into the `link` property in `gallery-data.ts`.

### 👥 **Social & Community**
*   **User Profiles**: Customizable profiles with avatars, bios, and stat counters.
*   **Follow System**: Follow your favorite creators and see their posts in a dedicated feed.
*   **Real-time Chat**: Instant direct messaging between users (powered by Supabase Realtime).
*   **Interactions**: Like and Comment on posts to engage with the community.
*   **Avatar Frames**: Users can equip special frames (Neon, Gold, Glitch) to stand out.

### 🛠 **Creator Tools**
*   **Content Management**: Upload, edit, and delete your own media posts.
*   **Premium Locking**: Mark content as "Premium" (simulated locking UI) for monetization.
*   **Google Drive Integration**: Seamlessly link content stored on Google Drive.

### 🛡 **Safety & Moderation**
*   **Age Verification**: Strict 18+ entry gate.
*   **Reporting System**: Users can flag inappropriate content.
*   **Legal**: Integrated Privacy Policy and Terms of Service modals.

### 💰 **Monetization (Coin System)**
*   **Wallet**: Users have a coin balance stored in the database.
*   **Shop**: Users can purchase coins via Stripe (requires backend setup) or by watching ads.
*   **Unlocking**: Users spend coins to unlock premium content.
*   **Cosmetics**: Users spend coins on Avatar Frames.

## 💻 Tech Stack

*   **Frontend**: React 19, TypeScript, Vite
*   **Styling**: Tailwind CSS (Dark Mode / Cyberpunk Theme)
*   **Backend as a Service**: Supabase
    *   **Auth**: Google OAuth & Session Management
    *   **Database**: PostgreSQL
    *   **Realtime**: WebSocket subscriptions for Chat & Notifications
    *   **Edge Functions**: Serverless functions for Stripe integration.

## 🗄 Database Schema (Supabase)

To run this project, your Supabase project requires the following tables. Run the SQL in the SQL Editor.

```sql
-- Profiles: Stores user info and COIN BALANCE
create table public.profiles (
  id uuid references auth.users not null primary key,
  name text,
  avatar text,
  bio text,
  coins integer default 0,
  frame text default 'none', -- New column for avatar frames
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Media: Stores posts
create table public.media (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id),
  type text,
  src text,
  description text,
  category text,
  tags text[],
  is_premium boolean default false,
  price integer default 0
);

-- Unlocked Media: Tracks who bought what
create table public.unlocked_media (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  media_id uuid references public.media(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Other tables: likes, comments, follows, messages, reports (standard schemas)
```

## ⚡ Setup Local Dev

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Configure `lib/supabaseClient.ts` with your Supabase URL and Anon Key.
4.  Run development server: `npm run dev`
