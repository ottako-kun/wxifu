
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

### 👥 **Social & Community**
*   **User Profiles**: Customizable profiles with avatars, bios, and stat counters.
*   **Follow System**: Follow your favorite creators and see their posts in a dedicated feed.
*   **Real-time Chat**: Instant direct messaging between users (powered by Supabase Realtime).
*   **Interactions**: Like and Comment on posts to engage with the community.

### 🛠 **Creator Tools**
*   **Content Management**: Upload, edit, and delete your own media posts.
*   **Premium Locking**: Mark content as "Premium" (simulated locking UI) for monetization.
*   **Google Drive Integration**: Seamlessly link content stored on Google Drive.

### 🛡 **Safety & Moderation**
*   **Age Verification**: Strict 18+ entry gate.
*   **Reporting System**: Users can flag inappropriate content.
*   **Legal**: Integrated Privacy Policy and Terms of Service modals.

## 💻 Tech Stack

*   **Frontend**: React 19, TypeScript, Vite
*   **Styling**: Tailwind CSS (Dark Mode / Cyberpunk Theme)
*   **Backend as a Service**: Supabase
    *   **Auth**: Google OAuth & Session Management
    *   **Database**: PostgreSQL
    *   **Realtime**: WebSocket subscriptions for Chat & Notifications

## 🗄 Database Schema (Supabase)

To run this project, your Supabase project requires the following tables:

1.  **profiles**: `id` (uuid, PK), `name` (text), `avatar` (text), `bio` (text).
2.  **media**: `id` (uuid), `user_id` (uuid), `type` (text), `src` (text), `description` (text), `category` (text), `tags` (text[]), `is_premium` (bool).
3.  **likes**: `id`, `user_id`, `media_id`.
4.  **comments**: `id`, `user_id`, `media_id`, `content`.
5.  **follows**: `follower_id`, `following_id`.
6.  **messages**: `id`, `sender_id`, `receiver_id`, `content`, `is_read`.
7.  **reports**: `id`, `media_id`, `reporter_id`, `reason`.

## ⚡ Setup

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Configure `lib/supabaseClient.ts` with your Supabase URL and Anon Key.
4.  Run development server: `npm run dev`

Enjoy the platform! 🎌
