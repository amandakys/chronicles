# CHRONICLES

A shared memory timeline web app with a Roman Empire aesthetic. Upload photos, add captions, and see memories from friends and family arranged chronologically with realtime updates.

**Memoria Aeterna** — Memories preserved through the ages.

## Tech Stack

- **Frontend**: React (Vite) deployed to Netlify
- **Backend**: Supabase (Postgres database + Storage)
- **Styling**: Custom CSS with Roman Empire theme

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up

### 2. Create the Database Table

Go to the **SQL Editor** in your Supabase dashboard and run:

```sql
-- Create the memories table
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  year INTEGER NOT NULL,
  caption TEXT,
  name TEXT,
  image_url TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read memories
CREATE POLICY "Allow public read access"
  ON memories
  FOR SELECT
  TO anon
  USING (true);

-- Allow anyone to insert memories
CREATE POLICY "Allow public insert access"
  ON memories
  FOR INSERT
  TO anon
  WITH CHECK (true);
```

### 3. Enable Realtime

1. Go to **Database** → **Replication** in your Supabase dashboard
2. Find the `memories` table and enable replication for it
3. This allows the timeline to update instantly when new memories are added

### 4. Create the Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Name it `memory-images`
4. Check **Public bucket** (this allows images to be viewed without authentication)
5. Click **Create bucket**

### 5. Set Storage Policies

After creating the bucket, click on it and go to **Policies**. Add these policies:

**Policy 1: Allow public uploads**
- Click **New policy** → **For full customization**
- Policy name: `Allow public uploads`
- Allowed operation: `INSERT`
- Target roles: `anon`
- Policy definition: `true`

**Policy 2: Allow public reads**
- Click **New policy** → **For full customization**
- Policy name: `Allow public reads`
- Allowed operation: `SELECT`
- Target roles: `anon`
- Policy definition: `true`

### 6. Get Your API Keys

1. Go to **Project Settings** → **API Keys** in your Supabase dashboard
2. Copy the **Project URL** (shown at the top)
3. Copy the **Publishable key** (starts with `sb_publishable_...`)

> **Note:** Supabase now uses new-style API keys. The publishable key replaces the old `anon` key. Both work identically with the Supabase client. If your project still shows `anon public` key, that works too.

### 7. Configure Environment Variables

Create a file at `client/.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_your-key-here
```

### 8. Run Locally

```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## Deploy to Netlify

### Option A: Deploy via Netlify CLI

```bash
npm install -g netlify-cli
cd client
netlify login
netlify init
netlify deploy --prod
```

### Option B: Deploy via GitHub

1. Push this repo to GitHub
2. Go to [netlify.com](https://netlify.com) and sign in
3. Click **Add new site** → **Import an existing project**
4. Connect your GitHub repo
5. Netlify will auto-detect the build settings from `netlify.toml`
6. Add environment variables in **Site settings** → **Environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Deploy!

## Features

- **Landing Page**: Dramatic Roman arch entrance with navigation
- **Upload Page**: Add memories with photo upload (device or camera), year, caption, and name
- **Timeline Page**: View all memories grouped by year with Roman numeral headers
- **Realtime Updates**: New memories appear instantly without page refresh
- **3D Card Flip**: Click any memory card to see the caption on the back
- **Responsive Design**: Works on desktop, tablet, and mobile

## Design Details

**Color Palette:**
- Background: `#1a1208` (near-black parchment)
- Primary: `#c9a84c` (aged gold)
- Accent: `#8b1a1a` (Roman crimson)
- Surface: `#2d1f0e` (dark walnut)
- Text: `#e8d5a3` (warm cream)

**Typography:**
- Headings: Cinzel Decorative (Google Fonts)
- Body: EB Garamond (Google Fonts)

**Motifs:**
- Laurel wreath dividers between year sections
- Parchment grain texture overlay
- Roman numeral year display
- Decorative column-style borders
- Wax seal success animation

## File Structure

```
chronicles/
├── README.md
└── client/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── netlify.toml
    ├── .env.example
    ├── public/
    │   └── laurel.svg
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── lib/
        │   └── supabase.js
        ├── utils/
        │   └── romanNumerals.js
        ├── components/
        │   ├── MemoryCard.jsx
        │   ├── MemoryCard.css
        │   ├── YearDivider.jsx
        │   ├── YearDivider.css
        │   ├── ImageCapture.jsx
        │   └── ImageCapture.css
        └── pages/
            ├── Landing.jsx
            ├── Landing.css
            ├── Upload.jsx
            ├── Upload.css
            ├── Timeline.jsx
            └── Timeline.css
```

## License

MIT
