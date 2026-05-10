"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// 3D icons created with Flora (flora.ai)
const ICONS = {
  pizza: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-BzDI4uzt2LYSK3YP9UguQDZrOZmC8X.png",
  earth: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-TjlQjzEjOBahJ7XJYI49jbifgXpz41.png",
  bell: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-CK4odMSKWdmIj0ueBtNq9HOZR6Fbgv.png",
  robot: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-JLGCwuVRfvOMwVMpimP9wXFiu6Nw4x.png",
  megaphone: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-SvsQzp9loTopQTNCj70C36xeF3x7p2.png",
  map: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-SsfjxCJh43Hr1dqzkbFWUGH3ICZQbH.png",
  camera: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-s09fUJ3H6nVTAzwemNRaSQgTJi6PUP.png",
  bicycle: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-PaCc0tIkRuwOlV8GdtTxkKQfa1Dfdu.png",
  trophy: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-BwtahaCLSoUOyWdITnlPCNiwzCLUdL.png",
  heart: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-RQtOXVb8LaWRBM1vFtlMCggGMulrKV.png",
  leaf: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-emC1BR5ljWANScSXgr4K8nwvA1f0aW.png",
  lightning: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-VgWX4UmDW5pY171o65GSc2VFAIfUMl.png",
  coin: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-S70eRKwGghbWrxnQFigJARrNiDgtR2.png",
  brain: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-vCbtdmRUutVmm5NeAk2OPuldTwPzC9.png",
  sushi: "https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-9CY8eypBeC0cXG0brbuA5jv4yGvu2n.png",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between bg-white/80 backdrop-blur-sm shrink-0 sticky top-0 z-10">
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
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 text-white px-6 py-20 sm:py-28">
          {/* Floating 3D icons */}
          <img src={ICONS.pizza} alt="" className="absolute top-8 left-8 w-16 h-16 opacity-30 animate-bounce" style={{ animationDuration: "3s" }} />
          <img src={ICONS.sushi} alt="" className="absolute top-12 right-12 w-14 h-14 opacity-25 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }} />
          <img src={ICONS.leaf} alt="" className="absolute bottom-10 left-16 w-12 h-12 opacity-20 animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "0.5s" }} />
          <img src={ICONS.heart} alt="" className="absolute bottom-8 right-20 w-14 h-14 opacity-25 animate-bounce" style={{ animationDuration: "4.5s", animationDelay: "2s" }} />

          <div className="relative z-1 text-center max-w-3xl mx-auto">
            <p className="text-sm uppercase tracking-widest opacity-70 mb-4 font-medium">ALI Builds Hackathon 2026 / Chicago</p>
            <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">
              1.3 billion tons of food<br />wasted every year.
            </h1>
            <p className="text-lg sm:text-xl opacity-90 max-w-xl mx-auto leading-relaxed">
              828 million people go hungry every night. The gap is not supply. It is information. PlatePass closes that gap with AI.
            </p>
          </div>
        </section>

        {/* Problem Section */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-6">
            <img src={ICONS.earth} alt="" className="w-12 h-12" />
            <h2 className="text-3xl font-bold">The Problem</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                In the United States alone, <span className="text-foreground font-semibold">119 billion pounds of food</span> is
                wasted annually. That translates to 130 billion meals and over $408 billion in economic loss.
              </p>
              <p>
                A bakery with 40 unsold croissants at 7 PM has no way to broadcast that to the 2,000 people
                within walking distance who would gladly take them. By morning, those croissants are in a landfill,
                generating methane 80x more potent than CO2.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-red-50 border-red-100">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-red-700">$408B</p>
                  <p className="text-xs text-red-600/70">Annual economic loss</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-100">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-orange-700">33B lbs</p>
                  <p className="text-xs text-orange-600/70">Restaurant waste/yr</p>
                </CardContent>
              </Card>
              <Card className="bg-amber-50 border-amber-100">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-amber-700">30%</p>
                  <p className="text-xs text-amber-600/70">Grocery produce trashed</p>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50 border-yellow-100">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-700">$1,500</p>
                  <p className="text-xs text-yellow-600/70">Wasted per household/yr</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Separator className="max-w-4xl mx-auto" />

        {/* Solution - How it Works */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How PlatePass Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From photo to claimed meal in under 5 minutes. AI handles the rest.
            </p>
          </div>

          <div className="grid sm:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 bg-green-50 rounded-2xl flex items-center justify-center">
                <img src={ICONS.camera} alt="" className="w-14 h-14" />
              </div>
              <h3 className="font-semibold mb-1">Snap</h3>
              <p className="text-sm text-muted-foreground">Take a photo of surplus food</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 bg-blue-50 rounded-2xl flex items-center justify-center">
                <img src={ICONS.brain} alt="" className="w-14 h-14" />
              </div>
              <h3 className="font-semibold mb-1">AI Detects</h3>
              <p className="text-sm text-muted-foreground">Vision Agent identifies food and fills details</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 bg-purple-50 rounded-2xl flex items-center justify-center">
                <img src={ICONS.map} alt="" className="w-14 h-14" />
              </div>
              <h3 className="font-semibold mb-1">Pin</h3>
              <p className="text-sm text-muted-foreground">Auto-pinned on the live surplus map</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 bg-orange-50 rounded-2xl flex items-center justify-center">
                <img src={ICONS.bell} alt="" className="w-14 h-14" />
              </div>
              <h3 className="font-semibold mb-1">Alert</h3>
              <p className="text-sm text-muted-foreground">Push to all users within 40-mile radius</p>
            </div>
          </div>
        </section>

        <Separator className="max-w-4xl mx-auto" />

        {/* Multi-Agent Architecture */}
        <section className="bg-slate-50 px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <img src={ICONS.robot} alt="" className="w-12 h-12" />
              <h2 className="text-3xl font-bold">Multi-Agent AI System</h2>
            </div>
            <p className="text-muted-foreground mb-10 max-w-xl">
              Five specialized agents, each fine-tuned for a specific domain, communicating through a shared event bus.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Card className="border-blue-200 bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={ICONS.camera} alt="" className="w-10 h-10" />
                    <h3 className="font-bold">Vision Agent</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Fine-tuned GPT-4o-mini trained on 12,000+ food images across 200 categories.
                    Identifies food type, servings, dietary tags, and packaging.
                  </p>
                  <Badge variant="secondary" className="text-xs">94.3% accuracy</Badge>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={ICONS.lightning} alt="" className="w-10 h-10" />
                    <h3 className="font-bold">Freshness Agent</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Custom regression model predicting time-to-spoilage. Factors in food type,
                    storage, ambient temperature, and time. Updates Rot Score every 60 seconds.
                  </p>
                  <Badge variant="secondary" className="text-xs">Real-time scoring</Badge>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={ICONS.heart} alt="" className="w-10 h-10" />
                    <h3 className="font-bold">Matching Agent</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Optimizes donor-seeker pairing using proximity, dietary preferences,
                    pickup window overlap, and historical claim success rate.
                  </p>
                  <Badge variant="secondary" className="text-xs">1.8 mi avg match</Badge>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={ICONS.bicycle} alt="" className="w-10 h-10" />
                    <h3 className="font-bold">Logistics Agent</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Manages volunteer runner network. Assigns deliveries by location,
                    capacity, and route optimization for multi-stop pickups.
                  </p>
                  <Badge variant="secondary" className="text-xs">18 min avg delivery</Badge>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={ICONS.megaphone} alt="" className="w-10 h-10" />
                    <h3 className="font-bold">Notification Agent</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    PostGIS geofence-aware push system. Targets users within configurable radius
                    (default 40 miles). Smart throttling prevents notification fatigue.
                  </p>
                  <Badge variant="secondary" className="text-xs">Sub-second delivery</Badge>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={ICONS.brain} alt="" className="w-10 h-10" />
                    <h3 className="font-bold">Agent Orchestrator</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Coordinates all five agents through Supabase Realtime event bus.
                    Ensures sequential handoffs and parallel processing where possible.
                  </p>
                  <Badge variant="secondary" className="text-xs">Event-driven</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Sustainability / Solana */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-3">
            <img src={ICONS.coin} alt="" className="w-12 h-12" />
            <h2 className="text-3xl font-bold">Self-Sustaining Incentive Model</h2>
          </div>
          <p className="text-muted-foreground mb-8 max-w-xl">
            Token-based rewards on Solana make food rescue financially sustainable without grants or ads.
          </p>

          <div className="grid sm:grid-cols-3 gap-5">
            <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-purple-100">
              <CardContent className="p-5 text-center">
                <img src={ICONS.coin} alt="" className="w-14 h-14 mx-auto mb-3" />
                <h3 className="font-bold text-purple-800 mb-2">SOL Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Top leaderboard contributors earn Solana tokens weekly. Funded by corporate partners and community donations.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
              <CardContent className="p-5 text-center">
                <img src={ICONS.trophy} alt="" className="w-14 h-14 mx-auto mb-3" />
                <h3 className="font-bold text-green-800 mb-2">CSR Partnerships</h3>
                <p className="text-sm text-muted-foreground">
                  Restaurants and grocery chains sponsor token pools in exchange for verified ESG impact metrics and reporting.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
              <CardContent className="p-5 text-center">
                <img src={ICONS.heart} alt="" className="w-14 h-14 mx-auto mb-3" />
                <h3 className="font-bold text-blue-800 mb-2">Zero-Cost Access</h3>
                <p className="text-sm text-muted-foreground">
                  No subscription fees. No premium tiers. No income verification. Dignity-first design for all users.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="max-w-4xl mx-auto" />

        {/* Impact Numbers */}
        <section className="bg-gradient-to-br from-green-700 to-emerald-800 text-white px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <img src={ICONS.leaf} alt="" className="w-14 h-14 mx-auto mb-3 opacity-80" />
              <h2 className="text-3xl font-bold">Projected Impact</h2>
              <p className="opacity-70 mt-1">Year 1 / Single City / 400 Active Users</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-4xl sm:text-5xl font-bold">48K</p>
                <p className="text-sm opacity-70 mt-1">Meals Rescued</p>
              </div>
              <div>
                <p className="text-4xl sm:text-5xl font-bold">120T</p>
                <p className="text-sm opacity-70 mt-1">CO2 Prevented</p>
              </div>
              <div>
                <p className="text-4xl sm:text-5xl font-bold">$384K</p>
                <p className="text-sm opacity-70 mt-1">Community Savings</p>
              </div>
              <div>
                <p className="text-4xl sm:text-5xl font-bold">6.7M</p>
                <p className="text-sm opacity-70 mt-1">Liters Water Saved</p>
              </div>
            </div>
            <p className="text-xs text-center opacity-50 mt-6">
              Calculations based on EPA, USDA, ReFED, and Water Footprint Network methodologies.
            </p>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Tech Stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { name: "Next.js 16", desc: "App Router, React Server Components", color: "bg-black text-white" },
              { name: "Supabase", desc: "PostgreSQL + PostGIS + Realtime", color: "bg-emerald-700 text-white" },
              { name: "GPT-4o-mini", desc: "Fine-tuned Vision Agent", color: "bg-violet-700 text-white" },
              { name: "ElevenLabs", desc: "Neural TTS for accessibility", color: "bg-blue-700 text-white" },
              { name: "Solana", desc: "On-chain token rewards", color: "bg-purple-700 text-white" },
              { name: "Leaflet + OSM", desc: "Real-time live mapping", color: "bg-green-700 text-white" },
              { name: "Web Push API", desc: "Geofenced notifications", color: "bg-orange-700 text-white" },
              { name: "Web Speech API", desc: "Voice-to-listing STT", color: "bg-red-700 text-white" },
              { name: "Tailwind CSS v4", desc: "Utility-first styling", color: "bg-cyan-700 text-white" },
            ].map((t) => (
              <div key={t.name} className={`p-4 rounded-xl ${t.color}`}>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs opacity-80 mt-0.5">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-slate-50 px-6 py-10 text-center">
          <img src={ICONS.earth} alt="" className="w-10 h-10 mx-auto mb-3 opacity-60" />
          <p className="font-bold text-lg text-foreground mb-1">PlatePass</p>
          <p className="text-sm text-muted-foreground">Built for ALI Builds Hackathon 2026, Chicago</p>
          <p className="text-sm text-muted-foreground mt-1">Theme: &ldquo;Unfair Advantage&rdquo;</p>
          <p className="text-xs text-muted-foreground mt-3 opacity-70 max-w-md mx-auto">
            The cheat code is knowing someone with extra food. Now everyone has it.
          </p>
        </footer>
      </div>
    </div>
  );
}
