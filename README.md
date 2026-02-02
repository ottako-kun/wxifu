# 🌸 wxifu Immersive Platform

Welcome to **wxifu** — The premier social stage for anime artwork, cosplay, and digital assets. Powered by a lightweight, high-performance **Google Sheets + Apps Script** backend.

Official URL: [https://wxifu.vercel.app/](https://wxifu.vercel.app/)

## ✨ About
wxifu is a fully-featured **Social Media Platform** built for artists and fans. It allows creators to upload, manage, and monetize their content while enabling fans to follow, chat, and interact in real-time. Built with a cyberpunk aesthetic, it prioritizes a premium user experience for high-resolution art and video consumption.

## 🚀 Key Features

### 🎨 **Immersive Gallery**
*   **Masonry Grid**: Optimized layout for mixed portrait/landscape artwork.
*   **TikTok-Style Feed**: Vertical scroll mode with immersive video playback and floating interaction HUD.
*   **Zoom & Pan**: Deep zoom capabilities for high-resolution illustrations.
*   **Smart Filtering**: Filter by tags, categories, or search authors.

### 📁 **Google Drive Integration**
The platform supports Google Drive links for both images and videos. 
1.  **Sign In** to the app.
2.  Click the **Upload Button** (Plus icon).
3.  Paste a **Google Drive Link** (ensure it is shared as "Anyone with the link").
    *   *Images*: Automatically converted to direct streamable links.
    *   *Videos*: Embedded via Google Drive preview player for seamless streaming.
4.  The content metadata is stored in your private **Google Sheet**.

### 👥 **Social & Community**
*   **User Profiles**: Customizable profiles with avatars, bios, and stat counters.
*   **Follow System**: Follow your favorite creators and see their posts in a dedicated "Following" tab.
*   **Instant Messaging**: Direct messaging between users.
*   **Interactions**: Like and Comment on posts to engage with the community.
*   **Avatar Frames**: Users can equip special frames (Neon, Gold, Glitch) to stand out.

### 💰 **Monetization (Coin System)**
*   **Wallet**: Users have a coin balance stored in the database.
*   **Shop**: Users can purchase coins or watch short ads to earn free credits.
*   **Unlocking**: Users spend coins to unlock "Premium" vault content.
*   **Cosmetics**: Users spend coins on collectible Avatar Frames.

## 💻 Tech Stack

*   **Frontend**: React 19, TypeScript, Vite
*   **Styling**: Tailwind CSS (Cyberpunk Dark Theme)
*   **Backend**: Google Apps Script (GAS)
*   **Database**: Google Sheets (NoSQL-style implementation)
*   **Auth**: Local Session Management (Mock OAuth)

## 🛠 Backend Setup (Google Sheets)

To run this project, you must set up your own database in Google Sheets.

1.  **Create a New Sheet**: Go to [sheets.new](https://sheets.new) and create a blank spreadsheet.
2.  **Open Apps Script**: Go to **Extensions > Apps Script**.
3.  **Copy Code**: Copy the contents of `BackEndCode.ts` from this project into the Apps Script editor.
4.  **Initial Setup**:
    *   In the editor, select the `setup` function from the dropdown.
    *   Click **Run**. This will create all necessary tabs (`profiles`, `media`, `likes`, etc.) and headers in your sheet.
5.  **Deploy**:
    *   Click **Deploy > New Deployment**.
    *   Select Type: **Web App**.
    *   Description: `wxifu Backend`.
    *   Execute as: **Me**.
    *   Who has access: **Anyone**. (Required for the frontend to communicate).
6.  **Connect Frontend**:
    *   Copy the **Web App URL** provided after deployment.
    *   Open `lib/client.ts` in your frontend project.
    *   Replace `PASTE_YOUR_GAS_WEBAPP_URL_HERE` with your new URL.

## ⚡ Setup Local Dev

1.  **Clone the repository**.
2.  **Install dependencies**: `npm install`
3.  **Run development server**: `npm run dev`
4.  **Authentication**: The app uses a mock authentication layer. Clicking "Sign In" will simulate a Google Login and create a profile in your Google Sheet automatically.

## 🛡 Safety & Moderation
*   **Age Verification**: Strict 18+ entry gate (stored in local storage).
*   **Reporting**: Integrated flagging system for inappropriate content.
*   **Privacy**: Minimal data collection (Public Name, Email, Avatar).