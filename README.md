
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

### 💰 **Monetization (Coin System)**
*   **Wallet**: Users have a coin balance stored in the database.
*   **Shop**: Users can purchase coins via Stripe (requires backend setup).
*   **Unlocking**: Users spend coins to unlock premium content.

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

## 💳 Stripe Monetization Setup

To make the payments work, you must deploy a Supabase Edge Function.

1.  **Init Supabase CLI**: `supabase init`
2.  **Create Function**: `supabase functions new create-checkout-session`
3.  **Code (`supabase/functions/create-checkout-session/index.ts`)**:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const PACKAGES = {
  'starter': { price_data: { currency: 'usd', product_data: { name: '100 Coins' }, unit_amount: 199 }, coins: 100 },
  'fan': { price_data: { currency: 'usd', product_data: { name: '500 Coins' }, unit_amount: 899 }, coins: 550 },
  'collector': { price_data: { currency: 'usd', product_data: { name: '1200 Coins' }, unit_amount: 1999 }, coins: 1400 },
  'whale': { price_data: { currency: 'usd', product_data: { name: '3500 Coins' }, unit_amount: 4999 }, coins: 4300 },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })

  try {
    const { packageId, returnUrl } = await req.json();
    const pkg = PACKAGES[packageId];
    if (!pkg) throw new Error("Invalid Package");

    // Get User from Auth Header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token) // Note: Need supabase client here if checking user

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: pkg.price_data, quantity: 1 }],
      mode: 'payment',
      success_url: `${returnUrl}?payment=success`,
      cancel_url: `${returnUrl}?payment=cancelled`,
      metadata: { 
          userId: 'USER_ID_FROM_AUTH_HEADER', // Extract this properly in production
          coins: pkg.coins 
      },
    });

    return new Response(JSON.stringify({ url: session.url }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
```

4.  **Set Secrets**: `supabase secrets set STRIPE_SECRET_KEY=sk_test_...`
5.  **Deploy**: `supabase functions deploy create-checkout-session`

## ⚡ Setup Local Dev

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Configure `lib/supabaseClient.ts` with your Supabase URL and Anon Key.
4.  Run development server: `npm run dev`
