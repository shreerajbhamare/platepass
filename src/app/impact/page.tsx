"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { User } from "@supabase/supabase-js";

interface ImpactStats {
  totalMealsShared: number;
  totalMealsClaimed: number;
  totalDeliveries: number;
  activeDonors: number;
  activeRunners: number;
  co2Saved: number; // kg
  waterSaved: number; // liters
  moneySaved: number; // USD
}

interface LeaderboardEntry {
  id: string;
  display_name: string;
  avatar_url: string | null;
  meals_shared: number;
  meals_claimed: number;
  deliveries_completed: number;
  impact_score: number;
  streak_days: number;
}

function getBadges(entry: LeaderboardEntry) {
  const badges: { label: string; color: string }[] = [];
  if (entry.meals_shared >= 50) badges.push({ label: "Super Donor", color: "#eab308" });
  else if (entry.meals_shared >= 20) badges.push({ label: "Generous", color: "#f97316" });
  else if (entry.meals_shared >= 5) badges.push({ label: "Contributor", color: "#22c55e" });

  if (entry.deliveries_completed >= 20) badges.push({ label: "Marathon Runner", color: "#8b5cf6" });
  else if (entry.deliveries_completed >= 5) badges.push({ label: "Runner", color: "#6366f1" });

  if (entry.streak_days >= 7) badges.push({ label: `${entry.streak_days}d Streak`, color: "#ef4444" });
  return badges;
}

export default function ImpactPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<ImpactStats>({
    totalMealsShared: 0,
    totalMealsClaimed: 0,
    totalDeliveries: 0,
    activeDonors: 0,
    activeRunners: 0,
    co2Saved: 0,
    waterSaved: 0,
    moneySaved: 0,
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardPage, setLeaderboardPage] = useState(0);
  const [hasMoreLeaderboard, setHasMoreLeaderboard] = useState(false);
  const [myProfile, setMyProfile] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  useEffect(() => {
    fetchStats();
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (user) fetchMyProfile();
  }, [user]);

  async function fetchStats() {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("meals_shared, meals_claimed, deliveries_completed");

    if (profiles) {
      const totalShared = profiles.reduce((s, p) => s + (p.meals_shared || 0), 0);
      const totalClaimed = profiles.reduce((s, p) => s + (p.meals_claimed || 0), 0);
      const totalDeliveries = profiles.reduce((s, p) => s + (p.deliveries_completed || 0), 0);
      const activeDonors = profiles.filter((p) => p.meals_shared > 0).length;
      const activeRunners = profiles.filter((p) => p.deliveries_completed > 0).length;

      setStats({
        totalMealsShared: totalShared,
        totalMealsClaimed: totalClaimed,
        totalDeliveries: totalDeliveries,
        activeDonors,
        activeRunners,
        co2Saved: Math.round(totalClaimed * 2.5), // ~2.5kg CO2 per meal saved
        waterSaved: Math.round(totalClaimed * 140), // ~140L water per meal
        moneySaved: Math.round(totalClaimed * 8), // ~$8 per meal
      });
    }
  }

  const PAGE_SIZE = 10;

  async function fetchLeaderboard(page = 0) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, meals_shared, meals_claimed, deliveries_completed, impact_score, streak_days")
      .order("impact_score", { ascending: false })
      .range(from, to);

    if (data) {
      if (page === 0) {
        setLeaderboard(data.slice(0, PAGE_SIZE) as LeaderboardEntry[]);
      } else {
        setLeaderboard((prev) => [...prev, ...data.slice(0, PAGE_SIZE)] as LeaderboardEntry[]);
      }
      setHasMoreLeaderboard(data.length > PAGE_SIZE);
      setLeaderboardPage(page);
    }
  }

  async function fetchMyProfile() {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, meals_shared, meals_claimed, deliveries_completed, impact_score, streak_days")
      .eq("id", user.id)
      .single();

    if (data) setMyProfile(data as LeaderboardEntry);
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between bg-white/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <a href="/" className="text-xl font-bold text-green-700">🍽️ PlatePass</a>
          <Badge variant="secondary">Impact</Badge>
        </div>
        <a
          href="/"
          className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded-md border border-border hover:bg-muted transition-colors"
        >
          Map
        </a>
      </header>

      <div className="flex-1 overflow-auto">
        {/* Hero Stats */}
        <div className="bg-gradient-to-br from-green-600 to-green-800 text-white p-6">
          <h2 className="text-lg font-semibold mb-4">Community Impact</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-3xl font-bold">{stats.totalMealsClaimed}</p>
              <p className="text-sm opacity-80">Meals Saved</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.co2Saved}kg</p>
              <p className="text-sm opacity-80">CO2 Prevented</p>
            </div>
            <div>
              <p className="text-3xl font-bold">${stats.moneySaved}</p>
              <p className="text-sm opacity-80">Community Savings</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.waterSaved}L</p>
              <p className="text-sm opacity-80">Water Saved</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 max-w-2xl mx-auto">
          {/* Community Activity */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-sm">Community Activity</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">{stats.activeDonors}</p>
                  <p className="text-xs text-muted-foreground">Active Donors</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-700">{stats.activeRunners}</p>
                  <p className="text-xs text-muted-foreground">Active Runners</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">{stats.totalMealsShared}</p>
                  <p className="text-xs text-muted-foreground">Meals Shared</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-700">{stats.totalDeliveries}</p>
                  <p className="text-xs text-muted-foreground">Deliveries Made</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Impact */}
          {myProfile && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-sm">Your Impact</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-xl">
                    {myProfile.avatar_url ? (
                      <img src={myProfile.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      "👤"
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{myProfile.display_name}</p>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {getBadges(myProfile).map((b) => (
                        <Badge key={b.label} style={{ backgroundColor: b.color, color: "white" }} className="text-xs">
                          {b.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold">{myProfile.meals_shared}</p>
                    <p className="text-xs text-muted-foreground">Shared</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{myProfile.meals_claimed}</p>
                    <p className="text-xs text-muted-foreground">Claimed</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{myProfile.deliveries_completed}</p>
                    <p className="text-xs text-muted-foreground">Delivered</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Impact Score</span>
                    <span className="font-medium">{myProfile.impact_score}</span>
                  </div>
                  <Progress value={Math.min(myProfile.impact_score, 100)} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-sm">Leaderboard</h3>
              {leaderboard.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No activity yet. Be the first!</p>
              )}
              <div className="space-y-2">
                {leaderboard.map((entry, i) => (
                  <div key={entry.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <span className="text-lg font-bold w-6 text-center text-muted-foreground">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm shrink-0">
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        "👤"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{entry.display_name}</p>
                      <div className="flex gap-1 flex-wrap">
                        {getBadges(entry).slice(0, 2).map((b) => (
                          <Badge key={b.label} style={{ backgroundColor: b.color, color: "white" }} className="text-[10px] px-1 py-0">
                            {b.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-green-700">{entry.impact_score} pts</span>
                  </div>
                ))}
              </div>
              {hasMoreLeaderboard && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 cursor-pointer"
                  onClick={() => fetchLeaderboard(leaderboardPage + 1)}
                >
                  Show More
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Environmental Impact Explainer */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-sm">How We Calculate Impact</h3>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Each meal saved from waste prevents approximately:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>2.5 kg of CO2 emissions from landfill decomposition</li>
                  <li>140 liters of water used in food production</li>
                  <li>$8 in food costs for community members</li>
                </ul>
                <p className="pt-1 italic">Sources: EPA, USDA, ReFED</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
