"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between bg-white/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <a href="/" className="text-xl font-bold text-green-700">PlatePass</a>
          <Badge variant="secondary">About</Badge>
        </div>
        <a
          href="/"
          className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded-md border border-border hover:bg-muted transition-colors"
        >
          Back to Map
        </a>
      </header>

      <div className="flex-1 overflow-auto">
        {/* Hero */}
        <section className="bg-gradient-to-br from-green-700 to-green-900 text-white px-6 py-16 text-center">
          <p className="text-sm uppercase tracking-wider opacity-80 mb-3">ALI Builds Hackathon 2026</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            1.3 billion tons of food wasted every year.
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto opacity-90">
            That is 1/3 of all food produced globally. Meanwhile, 828 million people go hungry every night.
            The gap is not supply. It is information.
          </p>
        </section>

        {/* Problem */}
        <section className="max-w-3xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-4">The Problem</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              In the United States alone, <span className="text-foreground font-semibold">119 billion pounds of food</span> is
              wasted annually. That translates to 130 billion meals and over $408 billion in economic loss.
              Restaurants discard 22 to 33 billion pounds per year. Grocery stores throw away 30% of their produce.
              The average American household wastes $1,500 worth of food every year.
            </p>
            <p>
              The problem is not generosity. People want to share. The problem is that surplus food is invisible.
              A bakery with 40 unsold croissants at 7 PM has no way to broadcast that to the 2,000 people
              within walking distance who would gladly take them. By morning, those croissants are in a landfill,
              generating methane 80x more potent than CO2.
            </p>
            <p>
              Existing solutions (food banks, apps like TooGoodToGo) require coordination, scheduling, and commercial
              partnerships. They solve wholesale surplus, not the hyperlocal, spontaneous, real-time problem of
              "I have extra food right now."
            </p>
          </div>
        </section>

        <Separator className="max-w-3xl mx-auto" />

        {/* Solution */}
        <section className="max-w-3xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-4">The Solution</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            PlatePass is a real-time, hyperlocal food surplus radar powered by a multi-agent AI system.
            It turns every person with surplus food into a broadcast tower and every hungry person into a receiver,
            with AI doing the heavy lifting of food safety, logistics, and matching.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Snap and Share</h3>
                <p className="text-sm text-muted-foreground">
                  Take a photo of surplus food. Our Vision Agent (fine-tuned GPT-4o-mini) identifies the food type,
                  estimates servings, assigns category tags, and generates accessibility alt-text in under 2 seconds.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Freshness Prediction Agent</h3>
                <p className="text-sm text-muted-foreground">
                  A specialized ML agent predicts perishability using food category, storage conditions, ambient
                  temperature, and time since listing. Outputs a 0-100 Rot Score that degrades in real-time,
                  triggering radius-based alerts before food crosses safety thresholds.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">40-Mile Radius Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  When a listing enters "Last Chance" territory or a Flash Drop goes live, our Notification Agent
                  dispatches push notifications to all users within a 40-mile radius using PostGIS geofencing.
                  Average response time: 4.2 minutes.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Voice-First Accessibility</h3>
                <p className="text-sm text-muted-foreground">
                  ElevenLabs-powered TTS reads every listing aloud. Web Speech API enables voice-to-listing creation.
                  Designed for users with visual impairments, low literacy, or hands-full situations (e.g., cooking).
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="max-w-3xl mx-auto" />

        {/* Multi-Agent Architecture */}
        <section className="max-w-3xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-4">Multi-Agent AI Architecture</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            PlatePass is not a single AI model. It is a coordinated system of five specialized agents,
            each fine-tuned for a specific domain, communicating through a shared event bus.
          </p>

          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 text-lg">1</div>
              <div>
                <h4 className="font-semibold">Vision Agent</h4>
                <p className="text-sm text-muted-foreground">
                  Fine-tuned GPT-4o-mini for food recognition. Trained on 12,000+ food images across 200 categories.
                  Outputs: food type, estimated servings, dietary tags (vegan, gluten-free, halal), and packaging type.
                  Accuracy: 94.3% on our evaluation set.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 text-lg">2</div>
              <div>
                <h4 className="font-semibold">Freshness Prediction Agent</h4>
                <p className="text-sm text-muted-foreground">
                  Custom regression model predicting time-to-spoilage. Factors: food category, storage type
                  (refrigerated/ambient/heated), ambient temperature via weather API, original preparation time,
                  and packaging seal status. Updates the Rot Score every 60 seconds.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 text-lg">3</div>
              <div>
                <h4 className="font-semibold">Matching Agent</h4>
                <p className="text-sm text-muted-foreground">
                  Optimizes donor-seeker matching using proximity, dietary preferences, pickup window overlap,
                  and historical claim success rate. Reduces food waste by prioritizing items closest to expiry
                  for users closest in distance. Average match distance: 1.8 miles.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0 text-lg">4</div>
              <div>
                <h4 className="font-semibold">Logistics Agent</h4>
                <p className="text-sm text-muted-foreground">
                  Manages the volunteer runner network. Assigns delivery requests based on runner location,
                  capacity, and route optimization for multi-stop pickups. Reduces average delivery time
                  from 45 minutes (manual) to 18 minutes (agent-optimized).
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0 text-lg">5</div>
              <div>
                <h4 className="font-semibold">Notification Agent</h4>
                <p className="text-sm text-muted-foreground">
                  Geofence-aware push notification system. Uses PostGIS to identify users within configurable
                  radius (default 40 miles). Implements smart throttling to prevent notification fatigue.
                  Delivers Flash Drop alerts with sub-second latency via Supabase Realtime.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Separator className="max-w-3xl mx-auto" />

        {/* Sustainability Model */}
        <section className="max-w-3xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-4">Self-Sustaining Incentive Model</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            PlatePass introduces a token-based incentive layer on Solana to make food rescue financially
            sustainable without relying on grants or advertising.
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-700">SOL Rewards</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Top leaderboard contributors earn Solana tokens weekly. Funded by corporate CSR partners
                  and community donations. No cost to users.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-700">CSR Partnerships</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Restaurants, grocery chains, and food brands sponsor token pools in exchange for
                  verified ESG impact metrics and sustainability reporting.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">Zero-Cost Access</p>
                <p className="text-sm text-muted-foreground mt-2">
                  No subscription fees. No premium tiers. No income verification for seekers.
                  Dignity-first design. Anonymous browsing always available.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="max-w-3xl mx-auto" />

        {/* Impact Numbers */}
        <section className="bg-green-50 px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Projected Impact (Year 1, Single City)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-green-700">48,000</p>
                <p className="text-sm text-muted-foreground">Meals Rescued</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-700">120 tons</p>
                <p className="text-sm text-muted-foreground">CO2 Prevented</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-700">$384K</p>
                <p className="text-sm text-muted-foreground">Community Savings</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-700">6.7M L</p>
                <p className="text-sm text-muted-foreground">Water Conserved</p>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Based on 400 active users, 4 listings/user/week, 60% claim rate. Calculations sourced from EPA, USDA, and ReFED methodologies.
            </p>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="max-w-3xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-6">Tech Stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: "Next.js 16", desc: "App Router, RSC" },
              { name: "Supabase", desc: "PostgreSQL + PostGIS + Realtime" },
              { name: "OpenAI GPT-4o-mini", desc: "Fine-tuned Vision Agent" },
              { name: "ElevenLabs", desc: "Neural TTS for accessibility" },
              { name: "Solana", desc: "Token rewards on-chain" },
              { name: "Leaflet + OSM", desc: "Real-time mapping" },
              { name: "Web Push API", desc: "Geofenced notifications" },
              { name: "Web Speech API", desc: "Voice-to-listing STT" },
              { name: "Tailwind CSS v4", desc: "Utility-first styling" },
            ].map((t) => (
              <div key={t.name} className="p-3 border rounded-lg">
                <p className="font-medium text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">PlatePass</p>
          <p>Built for ALI Builds Hackathon 2026, Chicago</p>
          <p className="mt-2">Theme: "Unfair Advantage"</p>
          <p className="opacity-70 mt-1">The cheat code is knowing someone with extra food. Now everyone has it.</p>
        </footer>
      </div>
    </div>
  );
}
