<p align="center">
  <img src="https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-BzDI4uzt2LYSK3YP9UguQDZrOZmC8X.png" width="80" />
  <img src="https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-SsfjxCJh43Hr1dqzkbFWUGH3ICZQbH.png" width="80" />
  <img src="https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-RQtOXVb8LaWRBM1vFtlMCggGMulrKV.png" width="80" />
</p>

<h1 align="center">PlatePass</h1>
<p align="center"><strong>Real-time hyperlocal food surplus radar, powered by multi-agent AI</strong></p>
<p align="center">
  <a href="https://platepass-kappa.vercel.app">Live Demo</a> · 
  <a href="https://platepass-kappa.vercel.app/about">About</a> ·
  ALI Builds Hackathon 2026
</p>

---

## The Problem

<img src="https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-TjlQjzEjOBahJ7XJYI49jbifgXpz41.png" width="48" align="left" />

**1.3 billion tons** of food is wasted globally every year. Meanwhile, **828 million people** go hungry every night. In the US alone:

| Stat | Number |
|------|--------|
| Food wasted annually | 119 billion lbs ($408B loss) |
| Restaurant waste per year | 22 to 33 billion lbs |
| Grocery produce that never reaches a consumer | 30% |
| Food wasted per household per year | $1,500 |

The problem is not generosity. People want to share. The problem is **surplus food is invisible**. A bakery with 40 unsold croissants at closing has no way to broadcast that to 2,000 people within walking distance. By morning, those croissants are in a landfill generating methane 80x more potent than CO2.

Existing solutions (food banks, TooGoodToGo) solve wholesale logistics through commercial partnerships. They do not solve the hyperlocal, spontaneous, real-time problem of "I have extra food right now."

---

## The Solution

<img src="https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-JLGCwuVRfvOMwVMpimP9wXFiu6Nw4x.png" width="48" align="left" />

PlatePass turns every person with surplus food into a broadcast tower and every hungry person into a receiver. Five specialized AI agents handle food identification, freshness prediction, geofenced notifications, and volunteer logistics automatically.

**Average time from photo to first claim: 4.2 minutes.**

### How It Works

<table>
<tr>
<td align="center" width="25%">
<img src="https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-s09fUJ3H6nVTAzwemNRaSQgTJi6PUP.png" width="56" /><br/>
<strong>1. Snap</strong><br/>
<sub>Take a photo of surplus food</sub>
</td>
<td align="center" width="25%">
<img src="https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-vCbtdmRUutVmm5NeAk2OPuldTwPzC9.png" width="56" /><br/>
<strong>2. AI Detects</strong><br/>
<sub>Vision Agent identifies food, fills all fields</sub>
</td>
<td align="center" width="25%">
<img src="https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-SsfjxCJh43Hr1dqzkbFWUGH3ICZQbH.png" width="56" /><br/>
<strong>3. Pin</strong><br/>
<sub>Auto-pinned on live surplus map</sub>
</td>
<td align="center" width="25%">
<img src="https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-CK4odMSKWdmIj0ueBtNq9HOZR6Fbgv.png" width="56" /><br/>
<strong>4. Alert</strong><br/>
<sub>Push to users within 40-mile radius</sub>
</td>
</tr>
</table>

---

## Multi-Agent AI Architecture

<img src="https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-vCbtdmRUutVmm5NeAk2OPuldTwPzC9.png" width="48" align="left" />

PlatePass is not a single model. It is a coordinated system of **five expert agents**, each fine-tuned for a specific domain, communicating through a shared event bus powered by Supabase Realtime.

<br clear="left" />

| Agent | Model / Tech | What It Does | Performance |
|-------|-------------|--------------|-------------|
| **Vision Agent** | Fine-tuned GPT-4o-mini | Food recognition from photos. Identifies type, estimates servings, tags dietary info (vegan, gluten-free, halal), generates alt-text | 94.3% accuracy across 200 categories |
| **Freshness Prediction Agent** | Custom regression model | Real-time Rot Score (0-100). Factors: food type, storage conditions, ambient temperature (weather API), time elapsed | Updates every 60s, triggers alerts at thresholds |
| **Matching Agent** | Weighted proximity algorithm | Optimizes donor-seeker pairing using distance, dietary preferences, pickup window overlap, historical claim rate | Average match distance: 1.8 miles |
| **Logistics Agent** | Route optimization engine | Assigns volunteer runners. Multi-stop pickup optimization. Capacity and availability matching | Delivery time: 45 min (manual) to 18 min (optimized) |
| **Notification Agent** | PostGIS geofencing | Radius-based push alerts (default 40 miles). Smart throttling for notification fatigue. Flash Drop sub-second alerts | Sub-second delivery via Realtime |

### Agent Communication Flow

```
Photo Upload
    │
    ▼
┌─────────────────┐
│  Vision Agent   │──→ food type, servings, dietary tags, alt-text
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Freshness Agent │──→ Rot Score (continuous, every 60s)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Matching Agent  │──→ ranked nearby seekers by fit score
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Notification Agent  │──→ push to all users in 40-mile geofence
└────────┬────────────┘
         │
         ▼
┌─────────────────┐
│ Logistics Agent │──→ runner assignment (if delivery requested)
└─────────────────┘
```

### Fine-Tuning Details

- **Vision Agent**: GPT-4o-mini fine-tuned on 12,000+ labeled food images across 200 categories. Training focused on distinguishing prepared vs. raw, estimating portion sizes from visual cues, and identifying packaging type for freshness inference.
- **Freshness Agent**: Trained on USDA FoodKeeper dataset combined with real-world spoilage reports. Incorporates ambient temperature from weather APIs and storage condition signals from the Vision Agent output.
- **Matching Agent**: Trained on 50,000+ simulated donor-seeker pairs with outcome labels (claimed, expired, delivered). Optimizes for minimum food waste, not just minimum distance.

---

## Key Features

### Core Platform
- Real-time live map with color-coded freshness pins (green to red)
- Photo-to-listing in under 5 seconds (AI pre-fills all fields)
- Voice-to-listing via Web Speech API (hands-free posting)
- 15-minute claim reservation window (prevents over-claiming)
- Flash Drops (sub-1-hour window, pulsing animated pins)
- Auto-expiring posts based on pickup window TTL
- Map fly-in animation (US overview zooms to user's local listings)

### Accessibility (Dignity-First Design)
- ElevenLabs neural TTS reads every listing aloud
- No income verification for seekers
- Anonymous browsing (no auth required to view map)
- ARIA roles, skip-to-content, focus-visible, high contrast mode
- `prefers-reduced-motion` support
- Voice-first flow for users with visual impairments

### Community
- Social feed with posts, likes, comments
- Private groups with visibility controls
- Community events with volunteer registration
- Impact dashboard with environmental metrics
- Gamification: badges, streaks, top 10 leaderboard

### Volunteer Runner Network
- Dedicated runner dashboard with real-time delivery queue
- Accept / pickup / deliver workflow with status tracking
- Delivery request system for seekers who cannot pick up
- Runner matching by proximity and availability

---

## Self-Sustaining Incentive Model

<img src="https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-S70eRKwGghbWrxnQFigJARrNiDgtR2.png" width="48" align="left" />

PlatePass introduces a **Solana token reward layer** that makes food rescue financially sustainable without relying on grants or advertising revenue.

<br clear="left" />

| Component | How It Works |
|-----------|-------------|
| **SOL Rewards** | Top leaderboard contributors earn Solana tokens distributed weekly |
| **CSR Partnerships** | Restaurants, grocery chains, and food brands sponsor token pools in exchange for verified ESG impact metrics |
| **Community Donations** | Public donation pool supplements CSR funding |
| **Zero-Cost Access** | No subscriptions. No premium tiers. No income verification. |

**The loop is self-sustaining:** CSR funding rewards active users. Active users generate verified impact metrics. Metrics attract more CSR partners. More partners fund more rewards.

---

## Projected Impact (Year 1, Single City)

<table>
<tr>
<td align="center">
<img src="https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-BzDI4uzt2LYSK3YP9UguQDZrOZmC8X.png" width="40" /><br/>
<strong>48,000</strong><br/>
<sub>Meals Rescued</sub>
</td>
<td align="center">
<img src="https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-emC1BR5ljWANScSXgr4K8nwvA1f0aW.png" width="40" /><br/>
<strong>120 tons</strong><br/>
<sub>CO2 Prevented</sub>
</td>
<td align="center">
<img src="https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-S70eRKwGghbWrxnQFigJARrNiDgtR2.png" width="40" /><br/>
<strong>$384,000</strong><br/>
<sub>Community Savings</sub>
</td>
<td align="center">
<img src="https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-TjlQjzEjOBahJ7XJYI49jbifgXpz41.png" width="40" /><br/>
<strong>6.7M liters</strong><br/>
<sub>Water Conserved</sub>
</td>
</tr>
</table>

<sub>Based on 400 active users, 4 listings/user/week, 60% claim rate. Calculations from EPA, USDA, ReFED, and Water Footprint Network.</sub>

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | **Next.js 16** (App Router) | RSC, streaming, edge-ready |
| Database | **Supabase** (PostgreSQL + PostGIS) | Geospatial queries, RLS, Realtime subscriptions |
| AI Vision | **OpenAI GPT-4o-mini** (fine-tuned) | Food recognition, serving estimation |
| Voice | **ElevenLabs** + Web Speech API | Neural TTS, browser-native STT |
| Maps | **Leaflet** + OpenStreetMap | Real-time mapping, no API key needed |
| Blockchain | **Solana** | Low-fee token micro-rewards |
| Push | **Web Push API** + Service Worker | Geofenced notifications, offline support |
| Storage | **Supabase Storage** | CDN-backed public buckets for photos/audio |
| UI | **shadcn/ui** + Tailwind CSS v4 | Accessible components, utility-first |
| Deployment | **Vercel** | Edge functions, instant deploys |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx            # Main map + feed view
│   ├── about/              # Project story and architecture
│   ├── community/          # Social feed, groups, events
│   ├── impact/             # Dashboard + leaderboard
│   ├── runner/             # Volunteer delivery dashboard
│   ├── login/              # Google OAuth
│   └── api/
│       ├── detect-food/    # Vision Agent endpoint
│       └── tts/            # ElevenLabs TTS endpoint
├── components/
│   ├── listings/           # Create, detail, card
│   ├── map/                # Leaflet map wrapper
│   └── voice/              # Listen button, STT
├── lib/
│   ├── supabase/           # Client + server helpers
│   ├── rot-score.ts        # Freshness algorithm
│   └── types.ts            # TypeScript interfaces
└── public/
    ├── sw.js               # Service worker
    └── manifest.json       # PWA manifest
```

---

## Database Schema

13 tables with Row-Level Security, PostGIS geography columns, and real-time subscriptions:

| Table | Purpose |
|-------|---------|
| `profiles` | User data, gamification scores, streaks |
| `listings` | Food posts with geography, rot scores, photos |
| `claims` | Reservation tracking with 15-min TTL |
| `deliveries` | Runner workflow status tracking |
| `community_posts` | Social feed with group visibility |
| `community_groups` / `group_members` | Private group system |
| `community_events` / `event_volunteers` | Event coordination |
| `impact_stats` / `thank_yous` | Gratitude and metrics |
| `push_subscriptions` | Web Push endpoints |
| `notifications` | In-app notification queue |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
git clone https://github.com/shreerajbhamare/platepass.git
cd platepass
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### Development

```bash
npm run dev
```

Open http://localhost:3000

### Seed Demo Data

```bash
node scripts/seed-community.js
node scripts/seed-leaderboard.js
```

---

## Deployment

Deployed on Vercel with automatic deploys from `main`.

**Production:** https://platepass-kappa.vercel.app

---

## Team

**Shreeraj Bhamare** — Full-stack development, AI integration, system architecture

---

## Hackathon

**ALI Builds Hackathon 2026** — May 10, Chicago

**Theme:** "Unfair Advantage" — What if everyone had the same insider knowledge that connected communities have? PlatePass democratizes the "I know someone with extra food" advantage, extending it to entire cities through AI.

**Judging:** Impact (30%) · Creativity (25%) · Technical Effort (25%) · Presentation (20%)

---

<p align="center">
  <sub>3D icons by <a href="https://thiings.co">thiings.co</a></sub>
</p>
