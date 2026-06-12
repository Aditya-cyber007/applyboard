# ApplyBoard

AI-powered Kanban board for tracking job applications. Drag cards across pipeline stages, paste a job description to get an ATS match score, and monitor your search with a stats dashboard.

**Live demo:** _add your Vercel URL here after deploying_

## Features

- **Kanban board** — drag applications across Applied → Screening → Technical → Final → Offer / Rejected
- **AI match scoring** — paste any JD + your resume; Gemini Flash returns a 0–100 ATS score, skill gaps, and auto-fills company/salary/location
- **Stats page** — response rate, pipeline breakdown by stage, average AI score
- **Auth** — Google/GitHub/email login via Clerk

## Tech Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |
| State | Zustand |
| Drag & Drop | dnd-kit |
| AI | Google Gemini 1.5 Flash |
| Deploy | Vercel |

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/applyboard
cd applyboard
npm install
```

### 2. Create `.env.local`

```bash
cp .env.example .env.local
```

Fill in the four services below.

### 3. Clerk (auth) — free

1. Go to [clerk.com](https://clerk.com) → Create application
2. Copy **Publishable Key** and **Secret Key** into `.env.local`

### 4. Supabase (database) — free

1. Go to [supabase.com](https://supabase.com) → New project
2. Open **SQL Editor** → paste the contents of `supabase/schema.sql` → Run
3. Go to **Settings → API** → copy **Project URL** and **service_role** key into `.env.local`

### 5. Gemini API (AI) — free

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Create an API key → copy into `.env.local`

### 6. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

```bash
# Push to GitHub first, then:
vercel
```

Add all four env vars from `.env.local` in the Vercel dashboard under **Settings → Environment Variables**.

## Project Structure

```
app/
  (auth)/sign-in, sign-up     # Clerk auth pages
  (dashboard)/board           # Kanban board page
  (dashboard)/stats           # Stats page
  api/applications/           # GET, POST, PATCH, DELETE
  api/analyze/                # Gemini AI endpoint
components/board/             # KanbanBoard, Column, Card, Modals
lib/
  types.ts                    # Application type + COLUMNS config
  store.ts                    # Zustand store
  supabase.ts                 # Supabase client (server-side)
supabase/schema.sql           # Run once to create DB table
```
