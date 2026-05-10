"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface DeliveryRequest {
  id: string;
  listing_id: string;
  claim_id: string | null;
  runner_id: string | null;
  requester_id: string | null;
  status: string;
  dropoff_address: string | null;
  notes: string | null;
  created_at: string;
  accepted_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  // Joined
  listing_title?: string;
  listing_photo?: string;
  pickup_address?: string;
  requester_name?: string;
}

export default function RunnerPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [available, setAvailable] = useState<DeliveryRequest[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<DeliveryRequest[]>([]);
  const [tab, setTab] = useState<"available" | "active">("available");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const fetchDeliveries = useCallback(async () => {
    // Available requests (no runner assigned)
    const { data: avail } = await supabase
      .from("deliveries")
      .select("*, listings(title, photo_url, pickup_address), profiles!deliveries_requester_id_fkey(display_name)")
      .eq("status", "requested")
      .order("created_at", { ascending: false });

    if (avail) {
      setAvailable(
        avail.map((d: Record<string, unknown>) => ({
          ...d,
          listing_title: (d.listings as Record<string, unknown>)?.title as string,
          listing_photo: (d.listings as Record<string, unknown>)?.photo_url as string,
          pickup_address: (d.listings as Record<string, unknown>)?.pickup_address as string,
          requester_name: (d.profiles as Record<string, unknown>)?.display_name as string,
        })) as DeliveryRequest[]
      );
    }

    // My active deliveries
    if (user) {
      const { data: mine } = await supabase
        .from("deliveries")
        .select("*, listings(title, photo_url, pickup_address), profiles!deliveries_requester_id_fkey(display_name)")
        .eq("runner_id", user.id)
        .in("status", ["accepted", "picked_up", "in_transit"])
        .order("accepted_at", { ascending: false });

      if (mine) {
        setMyDeliveries(
          mine.map((d: Record<string, unknown>) => ({
            ...d,
            listing_title: (d.listings as Record<string, unknown>)?.title as string,
            listing_photo: (d.listings as Record<string, unknown>)?.photo_url as string,
            pickup_address: (d.listings as Record<string, unknown>)?.pickup_address as string,
            requester_name: (d.profiles as Record<string, unknown>)?.display_name as string,
          })) as DeliveryRequest[]
        );
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchDeliveries();
  }, [user, fetchDeliveries]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("deliveries-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deliveries" },
        () => fetchDeliveries()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchDeliveries]);

  const acceptDelivery = async (deliveryId: string) => {
    if (!user) { toast.error("Please sign in"); return; }
    const { error } = await supabase
      .from("deliveries")
      .update({ runner_id: user.id, status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", deliveryId)
      .eq("status", "requested");

    if (error) toast.error("Failed to accept. Someone may have taken it.");
    else { toast.success("Delivery accepted! Head to pickup."); fetchDeliveries(); }
  };

  const updateStatus = async (deliveryId: string, newStatus: string) => {
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === "picked_up") updates.picked_up_at = new Date().toISOString();
    if (newStatus === "delivered") updates.delivered_at = new Date().toISOString();

    const { error } = await supabase
      .from("deliveries")
      .update(updates)
      .eq("id", deliveryId);

    if (error) toast.error("Update failed");
    else {
      toast.success(newStatus === "delivered" ? "Delivered! Thank you!" : "Status updated");
      fetchDeliveries();
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">🏃 Runner Dashboard</h1>
        <p className="text-muted-foreground mb-4">Sign in to volunteer as a food runner</p>
        <a
          href="/login"
          className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-lg bg-green-700 text-white hover:bg-green-800 transition-colors"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between bg-white/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <a href="/" className="text-xl font-bold text-green-700">🍽️ PlatePass</a>
          <Badge variant="secondary">Runner Mode</Badge>
        </div>
        <Button size="sm" variant="ghost" onClick={() => supabase.auth.signOut()} className="cursor-pointer">
          Sign Out
        </Button>
      </header>

      {/* Tab bar */}
      <div className="flex border-b shrink-0">
        <button
          className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "available" ? "border-green-600 text-green-700" : "border-transparent text-muted-foreground"}`}
          onClick={() => setTab("available")}
        >
          Available ({available.length})
        </button>
        <button
          className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "active" ? "border-green-600 text-green-700" : "border-transparent text-muted-foreground"}`}
          onClick={() => setTab("active")}
        >
          My Deliveries ({myDeliveries.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {tab === "available" && (
          <>
            {available.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-4xl mb-2">🏃</p>
                <p>No delivery requests right now.</p>
                <p className="text-sm mt-1">Check back soon — new requests appear in real-time!</p>
              </div>
            )}
            {available.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start gap-3">
                    {d.listing_photo ? (
                      <img src={d.listing_photo} alt="" className="w-14 h-14 rounded object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded bg-muted flex items-center justify-center text-2xl shrink-0">🍽️</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{d.listing_title || "Food Delivery"}</h3>
                      <p className="text-xs text-muted-foreground truncate">📍 Pickup: {d.pickup_address}</p>
                      {d.dropoff_address && (
                        <p className="text-xs text-muted-foreground truncate">🏠 Dropoff: {d.dropoff_address}</p>
                      )}
                      {d.requester_name && (
                        <p className="text-xs text-muted-foreground">For: {d.requester_name}</p>
                      )}
                    </div>
                  </div>
                  {d.notes && <p className="text-xs bg-muted p-2 rounded">{d.notes}</p>}
                  <Button size="sm" className="w-full cursor-pointer" onClick={() => acceptDelivery(d.id)}>
                    Accept Delivery
                  </Button>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {tab === "active" && (
          <>
            {myDeliveries.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-4xl mb-2">📦</p>
                <p>No active deliveries.</p>
                <p className="text-sm mt-1">Accept a request from the Available tab!</p>
              </div>
            )}
            {myDeliveries.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start gap-3">
                    {d.listing_photo ? (
                      <img src={d.listing_photo} alt="" className="w-14 h-14 rounded object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded bg-muted flex items-center justify-center text-2xl shrink-0">🍽️</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{d.listing_title || "Food Delivery"}</h3>
                      <p className="text-xs text-muted-foreground truncate">📍 {d.pickup_address}</p>
                      {d.dropoff_address && (
                        <p className="text-xs text-muted-foreground truncate">🏠 → {d.dropoff_address}</p>
                      )}
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {d.status === "accepted" && "📋 Head to pickup"}
                        {d.status === "picked_up" && "🚶 En route to dropoff"}
                        {d.status === "in_transit" && "🚗 In transit"}
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    {d.status === "accepted" && (
                      <Button size="sm" className="flex-1 cursor-pointer" onClick={() => updateStatus(d.id, "picked_up")}>
                        Picked Up
                      </Button>
                    )}
                    {(d.status === "picked_up" || d.status === "in_transit") && (
                      <Button size="sm" className="flex-1 cursor-pointer" onClick={() => updateStatus(d.id, "delivered")}>
                        Mark Delivered
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => updateStatus(d.id, "cancelled")}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
